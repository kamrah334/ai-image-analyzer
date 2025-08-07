import React, { useState } from 'react';
import axios from 'axios';

function App() {
    const [image, setImage] = useState(null);
    const [title, setTitle] = useState('');
    const [keywords, setKeywords] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleImageUpload = (e) => {
        setImage(e.target.files[0]);
    };

    const analyzeImage = async () => {
        if (!image) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('image', image);

        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/analyze`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setTitle(res.data.title);
            setKeywords(res.data.keywords);
        } catch (err) {
            alert('Error analyzing image');
        }
        setLoading(false);
    };

    const downloadCSV = async () => {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/csv`, { title, keywords }, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'results.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
            <h2>AI Image Analyzer</h2>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            <button onClick={analyzeImage} disabled={loading || !image} style={{ marginLeft: 10 }}>
                {loading ? 'Analyzing...' : 'Analyze Image'}
            </button>
            {title && (
                <div style={{ marginTop: 20 }}>
                    <h3>Generated Title</h3>
                    <p>{title}</p>
                    <h3>Keywords</h3>
                    <ul>
                        {keywords.map((k, i) => <li key={i}>{k}</li>)}
                    </ul>
                    <button onClick={downloadCSV}>Download CSV</button>
                </div>
            )}
        </div>
    );
}

export default App;
