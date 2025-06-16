// FLC APIs
app.get('/api/flc', async (req, res) => {
    try {
        const rows = await handleSheetOperation('get', 'FLC!A4:F');
        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: 'Không có dữ liệu' });
        }

        const newsData = rows.map(row => ({
            STT: row[0] || '',
            ga: row[1] || '',
            viTriLayNhanHang: row[2] || '',
            nguyenToa :row[3] || '',
            dongKg: row[4] || '',
            metKhoi: row[5] || '',
        }));

        res.json(newsData);
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        res.status(500).json({ error: 'Lỗi khi lấy dữ liệu' });
    }
}); 