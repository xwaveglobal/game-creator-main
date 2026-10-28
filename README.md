# Shadow Rider — 3D Character Studio

Demo HTML/WebGL cho nhân vật áo choàng trượt ván. Mô hình là mesh 3D thủ tục, không phải ảnh 2D dán lên tấm phẳng. Đây là bản diễn giải hình khối từ ảnh tham chiếu, không phải bản scan 3D chính xác.

## Chạy

Yêu cầu Node.js 20.19+ hoặc 22.12+.

```sh
npm install
npm run dev
```

Mở URL Vite in ra. `npm run build` tạo bản web tĩnh trong `dist/`. File nguồn `index.html` cần chạy qua máy chủ vì dùng modules. Bản đóng gói `output/shadow-rider-3d/shadow-rider-demo.html` đã nhúng toàn bộ JavaScript/CSS, có thể mở trực tiếp bằng Chrome/Edge, không cần cài Node.

Để cập nhật bản HTML độc lập và ZIP sau khi sửa source:

```sh
npm run build
python scripts/package_demo.py
```

## Điều khiển

- Kéo chuột xoay, cuộn thu phóng; chọn 6 góc camera bằng nút.
- Giữ ← / → để ôm cua; giữ ↓ để cúi trượt; ↑ hoặc Space bật nhảy; C cúi, W đi thẳng.
- Nút tư thế giữ tư thế đang chọn. Bật nhảy chạy một lần; bấm lại để phát lại.
- Chạy demo tự động luân phiên các động tác.
- Có đường chạy, xoay 360°, wireframe, PNG và GLB.

## Ghép vào game Three.js

```js
import { createShadowRider } from './src/ShadowRider.js';
const rider = createShadowRider();
scene.add(rider.root);
rider.setPose('left'); // ride | crouch | left | right | jump | slide
// Trong vòng lặp render, dt và time tính bằng giây:
rider.update(dt, time, { rolling: true });
```

Trục Y hướng lên, nhân vật nhìn về +Z, mặt đất Y=0. Camera game ở phía -Z. `left` là bên trái của nhân vật, tương ứng bên trái màn hình từ góc sau. `getStats()` thống kê mesh thực tế; `setWireframe(bool)` bật/tắt lưới.

`ShadowRider.js` chứa toàn bộ mesh, vật liệu, texture canvas tạo cục bộ và chuyển động. Có thể đặt `rider.root.position` trong game; animation chạy trên group con nên không ghi đè vị trí game. Ánh sáng và đường chạy chỉ thuộc `main.js`.

## Xuất mô hình và giới hạn

Nút GLB xuất mesh cùng vật liệu/texture và transform **tại tư thế hiện tại**. Các group khớp được giữ, nhưng GLB chưa có skeleton skinning hoặc animation clips; muốn giữ chuyển động hiện tại trong game Three.js hãy dùng module JS. Áo choàng có mesh biến dạng theo thời gian; lỗ rách dùng alpha cutout. Mô hình nhiều chi tiết, chưa có LOD hoặc tối ưu draw calls cho điện thoại. Nên tối ưu/retopology trước khi dùng cho nhiều nhân vật.

Giao diện dùng font Google khi có Internet, có font dự phòng. Toàn bộ texture nhân vật được tạo trong trình duyệt, không phụ thuộc CDN hoặc image API khi chạy bản build.
