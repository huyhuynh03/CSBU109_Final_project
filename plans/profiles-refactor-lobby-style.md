# Refactor: Hồ sơ cấu hình → Mô hình giống Lobby

## 1. Vấn đề hiện tại

Trang `/profiles` dùng **layout 2 cột**:
- Trái: `ProfileFolderTree` sidebar → chọn folder = filter
- Phải: danh sách card types được lọc theo folder

**Vấn đề**: Khi chọn folder "Bộ thẻ tiếng Anh", card types từ folder khác vẫn hiển thị (lỗi filter hoặc UX khó hiểu). User muốn triết lý rõ ràng hơn: **click folder → vào trong folder → thấy nội dung**.

## 2. Thiết kế mới: Giống Lobby

### So sánh Lobby vs Profile mới:

| Lobby | Profile - MỚI |
|-------|---------------|
| `/` → FolderTree + stats | `/profiles` → ProfileFolderTree + card types chưa phân loại |
| Click folder → `/folder/:id` | Click folder → `/profiles/folder/:id` |
| FolderViewPage: breadcrumb + subfolders + cards | ProfileFolderViewPage: breadcrumb + subfolders + card types |
| `FolderTree` component | `ProfileFolderTree` component - refactor |
| `FolderViewPage` | `ProfileFolderViewPage` - MỚI |

### 2.1 Trang /profiles - Trang chính

```
+---------------------------------------------+
| < Hồ sơ cấu hình                    [+ Mới] |
+---------------------------------------------+
|                                              |
| +-- Cây thư mục hồ sơ ---------+   [+folder]|
| |                                |            |
| |  > Bộ thẻ tiếng Anh           |            |
| |  > Bộ thẻ tiếng Trung         |            |
| |  > Bộ thẻ tiếng Nhật          |            |
| |                                |            |
| +--------------------------------+            |
|                                              |
| -- Hồ sơ chưa phân loại --                  |
| +-------------------------------------------+|
| | [icon] Thẻ tổng hợp          3 trường    >||
| +-------------------------------------------+|
| +-------------------------------------------+|
| | [icon] Thẻ từ điển            5 trường    >||
| +-------------------------------------------+|
+---------------------------------------------+
```

- Hiển thị cây thư mục profile ở trên
- Bên dưới: card types có `folderId === null` - chưa phân loại
- Nút [+ Mới] tạo card type mới
- Click folder → navigate tới `/profiles/folder/:folderId`
- Click card type → navigate tới `/profiles/:typeId`

### 2.2 Trang /profiles/folder/:id - Chi tiết folder

```
+---------------------------------------------+
| Home > Bộ thẻ tiếng Anh            [actions] |
+---------------------------------------------+
|                                              |
| -- Thư mục con (2) --                       |
| +----------+ +----------+                    |
| | Từ vựng  | | Ngữ pháp |                    |
| +----------+ +----------+                    |
|                                              |
| -- Hồ sơ cấu hình (3) --                    |
| +-------------------------------------------+|
| | [icon] Từ vựng cơ bản        4 trường    >||
| +-------------------------------------------+|
| | [icon] Từ vựng nâng cao      5 trường    >||
| +-------------------------------------------+|
| | [icon] Idioms                 3 trường    >||
| +-------------------------------------------+|
|                                              |
| [+ Tạo thư mục con] [+ Tạo hồ sơ]          |
+---------------------------------------------+
```

- Breadcrumb navigation: Home > Parent > Current
- Subfolders grid: click → navigate deeper
- Card types trong folder này
- Actions: đổi tên, xóa folder
- Nút tạo thư mục con, tạo hồ sơ mới

### 2.3 Trang /profiles/:id - Editor - GIỮ NGUYÊN

ProfileEditorPage giữ nguyên, chỉ cập nhật:
- Breadcrumb: thêm link về folder cha nếu có
- Back button navigate về folder cha thay vì `/profiles`

## 3. Luồng Navigation

```mermaid
graph TD
    A[Sidebar: Hồ sơ cấu hình] --> B[/profiles]
    B -->|click folder| C[/profiles/folder/:folderId]
    B -->|click card type| D[/profiles/:typeId - Editor]
    C -->|click subfolder| C
    C -->|click card type| D
    C -->|breadcrumb Home| B
    C -->|breadcrumb parent| C
    D -->|back button| E{có folderId?}
    E -->|có| C
    E -->|không| B
```

## 4. Thay đổi Files

### 4.1 SỬA: profile-folder-tree.js
- Thêm method `getBreadcrumb(folderId)` - tương tự `FolderTree.getBreadcrumb()`
- Thêm method `getChildren(parentId)` - đã có nhưng cần verify
- Đổi `onFolderClick()` từ dispatch event → `Router.navigate('/profiles/folder/{id}')`
- Bỏ `selectedFolderId` state - không cần highlight nữa
- Bỏ CSS `tree-item-selected`

### 4.2 SỬA: profiles.js - Rewrite hoàn toàn
- Bỏ layout 2 cột
- Hiển thị: cây thư mục + card types chưa phân loại dưới cùng
- Bỏ event listener `profile-folder-selected`
- Giữ: showCreateTypeModal, _createCardType, showDeleteTypeConfirm, _deleteCardType

### 4.3 MỚI: profile-folder-view.js
- Trang chi tiết folder profile
- Pattern giống `folder-view.js` nhưng dùng `ProfileFolderTree` + `cardTypes`
- Breadcrumb, subfolders grid, card types list
- Actions: tạo subfolder, tạo card type, đổi tên, xóa folder

### 4.4 SỬA: profile-editor.js
- Back button: navigate về `/profiles/folder/:folderId` nếu có folderId, ngược lại `/profiles`
- Optional: thêm breadcrumb

### 4.5 SỬA: app.js
- Thêm route `/profiles/folder/:id` → ProfileFolderViewPage
- Giữ `/profiles` và `/profiles/:id`

### 4.6 SỬA: index.html
- Thêm script tag cho `profile-folder-view.js`

### 4.7 SỬA: sw.js
- Thêm asset `profile-folder-view.js`
- Bump versions

### 4.8 SỬA: responsive.css
- Xóa CSS `.profiles-layout` grid 2 cột
- Thêm CSS cho subfolder grid trong profile folder view nếu cần

## 5. Firestore - KHÔNG thay đổi

Data model giữ nguyên:
- `profileFolders` collection: folders lồng nhau
- `cardTypes` collection: có `folderId` link tới profileFolder
- CRUD methods trong `firestore.js`: giữ nguyên

## 6. Implementation Order

1. **Refactor `profile-folder-tree.js`**: thêm getBreadcrumb, đổi onFolderClick → navigate
2. **Rewrite `profiles.js`**: bỏ 2 cột → cây thư mục + card types chưa phân loại
3. **Tạo `profile-folder-view.js`**: trang folder chi tiết
4. **Sửa `profile-editor.js`**: back button thông minh
5. **Sửa `app.js`**: đăng ký route mới
6. **Sửa `index.html`**: script tag
7. **Sửa `sw.js`**: asset + bump version
8. **Sửa `responsive.css`**: cleanup + thêm CSS mới
