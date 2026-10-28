# Lime Mascot Studio

Demo 3D độc lập, không thay đổi game Bike Rush hoặc demo Shadow Rider.

- Mở `lime-mascot-demo.html` trực tiếp bằng Chrome hoặc Edge. Không cần mạng.
- Kéo để xoay, cuộn để thu phóng; chọn 9 tư thế và 6 góc camera.
- Có tạm dừng, thay đổi tốc độ, wireframe, tự xoay, ẩn sàn, chụp PNG.
- Xuất GLB chứa mô hình và phân cấp khớp ở tư thế hiện tại; không kèm animation clip hay skin weights. Blender: File > Import > glTF 2.0.
- Nguồn dùng Three.js; animation điều khiển bằng transform các khớp trong `Mascot.js`.
- Đây là mô hình procedural tham khảo ảnh, không phải bản scan hoặc nguồn Blender sculpt.

Chạy từ workspace có sẵn dependencies: `node node_modules/vite/bin/vite.js mascot-studio --host 127.0.0.1`.
Build: `node node_modules/vite/bin/vite.js build mascot-studio --base ./`.
