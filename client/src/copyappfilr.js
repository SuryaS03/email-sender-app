//function App() {
  const [sheetURL, setSheetURL] = useState('');
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [emailColumn, setEmailColumn] = useState('');
  const [userIdColumn, setUserIdColumn] = useState('');
  const [loadingColumns, setLoadingColumns] = useState(false);

  const [includeCommonMessage, setIncludeCommonMessage] = useState(false);
  const [commonMessage, setCommonMessage] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');

  const extractSheetId = (url) => {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : '';
  };

  const loadColumns = async () => {
    const sheetId = extractSheetId(sheetURL);
    if (!sheetId) {
      alert('Invalid Google Sheet URL');
      return;
    }

    setLoadingColumns(true);
    try {
      const response = await fetch(`https://opensheet.vercel.app/${sheetId}/Sheet1`);
      const jsonData = await response.json();
      setData(jsonData);
      setColumns(jsonData.length > 0 ? Object.keys(jsonData[0]) : []);
    } catch (err) {
      alert('Failed to load sheet data');
      console.error(err);
      setColumns([]);
      setData([]);
    }
    setLoadingColumns(false);
  };

  const toggleColumn = (col) => {
    setSelectedColumns(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  const escapeHtml = (unsafe) => {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const sendEmails = async () => {
    if (!emailColumn) return alert('Please select the Email column');
    if (selectedColumns.length === 0) return alert('Please select at least one column');
    if (includeCommonMessage && commonMessage.trim() === '') return alert('Common message is enabled but empty');

    const start = rangeStart ? parseInt(rangeStart) : 1;
    const end = rangeEnd ? parseInt(rangeEnd) : data.length;
    if (isNaN(start) || start < 1 || start > data.length) {
      return alert(`Start range must be between 2 and ${data.length}`);
    }
    if (isNaN(end) || end < start || end > data.length) {
      return alert(`End range must be between ${start} and ${data.length}`);
    }

    const sliceData = data.slice(start - 2, end);

    const finalData = sliceData.map(row => {
      let htmlParts = [];
      htmlParts.push(`<p><b>Email ID:</b> ${escapeHtml(row[emailColumn])}</p>`);
      if (userIdColumn) {
        htmlParts.push(`<p><b>User ID:</b> ${escapeHtml(row[userIdColumn])}</p>`);
      }
      selectedColumns.forEach(col => {
        if (col !== emailColumn && col !== userIdColumn) {
          htmlParts.push(`<p><b>${escapeHtml(col)}:</b> ${escapeHtml(row[col] || '')}</p>`);
        }
      });
      if (includeCommonMessage) {
        htmlParts.push(`<br/><p>${escapeHtml(commonMessage)}</p>`);
      }

      return {
        Email: row[emailColumn],
        Message: htmlParts.join(''),
        Subject: emailSubject || 'Notification',
      };
    });

    try {
      const res = await fetch('http://localhost:5000/api/send-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      });
      const result = await res.json();
      if (result.status === 'success') {
        alert(`Emails sent! Count: ${finalData.length}`);
      } else {
        alert('Error sending some or all emails');
      }
    } catch (err) {
      alert('Network error sending emails');
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h2>Email Sender via Google Sheet with Custom Column Selection</h2>
      <input
        type="text"
        placeholder="Paste Google Sheet URL"
        value={sheetURL}
        onChange={e => setSheetURL(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
      />
      <button onClick={loadColumns} disabled={loadingColumns} style={{ marginBottom: '1rem' }}>
        {loadingColumns ? 'Loading...' : 'Load Columns'}
      </button>

      {columns.length > 0 && (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <label>
              <strong>Select the Email column: </strong>
              <select value={emailColumn} onChange={e => setEmailColumn(e.target.value)}>
                <option value="">--Select Email Column--</option>
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>
              <strong>Select the User ID column (optional): </strong>
              <select value={userIdColumn} onChange={e => setUserIdColumn(e.target.value)}>
                <option value="">--None--</option>
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <strong>Select columns to include in message:</strong>
            <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ccc', padding: '0.5rem' }}>
              {columns.map(col => (
                <label key={col} style={{ display: 'block' }}>
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(col)}
                    onChange={() => toggleColumn(col)}
                    disabled={col === emailColumn || col === userIdColumn}
                  />{' '}
                  {col}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>
              <strong>Email Subject: </strong>
              <input
                type="text"
                placeholder="Enter email subject (optional)"
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.3rem' }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>
              <input
                type="checkbox"
                checked={includeCommonMessage}
                onChange={e => setIncludeCommonMessage(e.target.checked)}
              />{' '}
              Append a common message to all emails
            </label>
          </div>

          {includeCommonMessage && (
            <textarea
              placeholder="Enter common message"
              value={commonMessage}
              onChange={e => setCommonMessage(e.target.value)}
              style={{ width: '100%', height: '100px', marginBottom: '1rem' }}
            />
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label>
              <strong>Send emails in row range:</strong> (1-based inclusive)<br />
              <input
                type="number"
                min="1"
                max={data.length}
                placeholder="Start row"
                value={rangeStart}
                onChange={e => setRangeStart(e.target.value)}
                style={{ width: '120px', marginRight: '1rem', padding: '0.3rem' }}
              />
              <input
                type="number"
                min="1"
                max={data.length}
                placeholder="End row"
                value={rangeEnd}
                onChange={e => setRangeEnd(e.target.value)}
                style={{ width: '120px', padding: '0.3rem' }}
              />
            </label>
          </div>

          <button onClick={sendEmails} style={{ padding: '0.5rem 1rem' }}>
            Send Emails
          </button>
        </>
      )}
    </div>
  );
//}

//export default App;