
async function testUpload() {
    try {
        const formData = new FormData();
        const file = new Blob(['test content'], { type: 'text/plain' });
        formData.append('file', file, 'test.txt');

        console.log('Sending request to http://localhost:3000/api/upload...');
        const res = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData,
        });

        console.log('Status:', res.status);
        console.log('Content-Type:', res.headers.get('content-type'));
        const text = await res.text();
        console.log('Body preview:', text.substring(0, 500));
    } catch (error) {
        console.error('Error:', error);
    }
}

testUpload();
