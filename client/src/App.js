
// import React, { useState } from 'react';
// import './App.css';

// function App() {
//   const [sheetURL, setSheetURL] = useState('');
//   const [columns, setColumns] = useState([]);
//   const [data, setData] = useState([]);
//   const [selectedColumns, setSelectedColumns] = useState([]);
//   const [emailColumn, setEmailColumn] = useState('');
//   const [loadingColumns, setLoadingColumns] = useState(false);
//   const [includeCommonMessage, setIncludeCommonMessage] = useState(false);
//   const [commonMessage, setCommonMessage] = useState('');
//   const [emailSubject, setEmailSubject] = useState('');
//   const [rangeStart, setRangeStart] = useState('');
//   const [rangeEnd, setRangeEnd] = useState('');
//   const [sendAll, setSendAll] = useState(false);

//   const extractSheetId = (url) => {
//     const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
//     return match ? match[1] : '';
//   };

//   const loadColumns = async () => {
//     const sheetId = extractSheetId(sheetURL);
//     if (!sheetId) {
//       alert('Invalid Google Sheet URL');
//       return;
//     }

//     setLoadingColumns(true);
//     try {
//       const response = await fetch(`https://opensheet.vercel.app/${sheetId}/Sheet1`);
//       const jsonData = await response.json();
//       setData(jsonData);
//       setColumns(jsonData.length > 0 ? Object.keys(jsonData[0]) : []);
//     } catch (err) {
//       alert('Failed to load sheet data');
//       console.error(err);
//       setColumns([]);
//       setData([]);
//     }
//     setLoadingColumns(false);
//   };

//   const toggleColumn = (col) => {
//     setSelectedColumns(prev =>
//       prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
//     );
//   };

//   const escapeHtml = (unsafe) => {
//     if (!unsafe) return '';
//     return unsafe
//       .replace(/&/g, "&amp;")
//       .replace(/</g, "&lt;")
//       .replace(/>/g, "&gt;")
//       .replace(/"/g, "&quot;")
//       .replace(/'/g, "&#039;");
//   };

//   const sendEmails = async () => {
//     if (!emailColumn) return alert('Please select the Email column');
//     if (selectedColumns.length === 0) return alert('Please select at least one column');
//     if (includeCommonMessage && commonMessage.trim() === '') return alert('Common message is enabled but empty');

//     let start = rangeStart ? parseInt(rangeStart) : 1;
//     let end = rangeEnd ? parseInt(rangeEnd) : data.length;

//     if (sendAll) {
//       start = 2;
//       end = data.length;
//     } else {
//       if (start === 1) start = 2;
//       if (isNaN(start) || start < 2 || start > data.length) {
//         return alert(`Start range must be between 2 and ${data.length}`);
//       }
//       if (isNaN(end) || end < start || end > data.length) {
//         return alert(`End range must be between ${start} and ${data.length}`);
//       }
//     }

//     const sliceData = data.slice(start - 2, end);

//     const finalData = sliceData.map(row => {
//       let htmlParts = [];
//       htmlParts.push(`<p><b>Email ID:</b> ${escapeHtml(row[emailColumn])}</p>`);
//       selectedColumns.forEach(col => {
//         if (col !== emailColumn) {
//           htmlParts.push(`<p><b>${escapeHtml(col)}:</b> ${escapeHtml(row[col] || '')}</p>`);
//         }
//       });
//       if (includeCommonMessage) {
//         htmlParts.push(`<br/><p>${escapeHtml(commonMessage)}</p>`);
//       }

//       return {
//         Email: row[emailColumn],
//         Message: htmlParts.join(''),
//         Subject: emailSubject || 'Notification',
//       };
//     });

//     try {
//       const res = await fetch('https://email-sender-app-yyiy.onrender.com/api/send-emails', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(finalData)
//       });
//       const result = await res.json();
//       if (result.status === 'success') {
//         alert(`Emails sent! Count: ${finalData.length}`);
//       } else {
//         alert('Error sending some or all emails');
//       }
//     } catch (err) {
//       alert('Network error sending emails');
//       console.error(err);
//     }
//   };

//   return (
//     <div className="app-container">
//       <h1 className="heading-premium">
//         Email Sender via Google Sheet
//       </h1>

//       <div className="card">
//         <label className="note-text">
//           Note: Make sure your Google Sheet is set to <b>Public Access</b> or <b>Anyone with the link can view</b> before loading columns.
//         </label>
//         <input
//           className="input-box"
//           type="text"
//           placeholder="Paste Google Sheet URL"
//           value={sheetURL}
//           onChange={e => setSheetURL(e.target.value)}
//         />
//         <button className="btn-primary" onClick={loadColumns} disabled={loadingColumns}>
//           {loadingColumns ? 'Loading...' : 'Load Columns'}
//         </button>
//       </div>

//       {columns.length > 0 && (
//         <div className="card">
//           <label className="label-spaced">
//             Select Email column:
//           </label>
//           <select
//             className="input-box spaced-select"
//             value={emailColumn}
//             onChange={e => setEmailColumn(e.target.value)}
//           >
//             <option value="">--Select Email Column--</option>
//             {columns.map(col => (
//               <option key={col} value={col}>{col}</option>
//             ))}
//           </select>

//           <label className="label-spaced">
//             Select columns to include in message:
//           </label>
//           <div className="checkbox-container">
//             {columns.map(col => (
//               <label key={col} className="checkbox-label">
//                 <input
//                   type="checkbox"
//                   checked={selectedColumns.includes(col)}
//                   onChange={() => toggleColumn(col)}
//                   disabled={col === emailColumn}
//                 />{' '}
//                 {col}
//               </label>
//             ))}
//           </div>

//           <label className="label-spaced">
//             Email Subject:
//           </label>
//           <input
//             className="input-box"
//             type="text"
//             value={emailSubject}
//             placeholder="Enter Subject / Optional"
//             onChange={e => setEmailSubject(e.target.value)}
//           />

//           <label className="checkbox-label bold-checkbox">
//             <input
//               type="checkbox"
//               checked={includeCommonMessage}
//               onChange={e => setIncludeCommonMessage(e.target.checked)}
//             />{' '}
//             Append a common message
//           </label>

//           {includeCommonMessage && (
//             <textarea
//               className="textarea-box"
//               placeholder="Enter common message"
//               value={commonMessage}
//               onChange={e => setCommonMessage(e.target.value)}
//             />
//           )}

//           <label className="checkbox-label bold-checkbox">
//             <input
//               type="checkbox"
//               checked={sendAll}
//               onChange={e => setSendAll(e.target.checked)}
//             />{' '}
//             Send to all rows
//           </label>

//           {!sendAll && (
//             <div className="range-container">
//               <input
//                 type="number"
//                 className="input-box"
//                 placeholder="Start row"
//                 value={rangeStart}
//                 onChange={e => setRangeStart(e.target.value)}
//               />
//               <input
//                 type="number"
//                 className="input-box"
//                 placeholder="End row"
//                 value={rangeEnd}
//                 onChange={e => setRangeEnd(e.target.value)}
//               />
//             </div>
//           )}

//           <button className="btn-primary" onClick={sendEmails}>
//             Send Emails
//           </button>
//         </div>
        
//       )}
//       <footer className="footer">
//   <p className="footer-text">
//      <strong>Surya'S - Email Tool</strong>
//   </p>
//   <div className="footer-icons">
//     <a
//      href="https://www.linkedin.com/in/suryas7203"
//       target="_blank"
//       rel="noopener noreferrer"
//     >
//       <i className="fab fa-linkedin-in"></i>
//     </a>
//     <a href="mailto:suryaskgmofficial.email@example.com">
//       <i className="fas fa-envelope"></i>
//     </a>
//   </div>
// </footer>

//     </div>
    
    
//   );
  
// }

// export default App;
import React, { useState } from 'react';
import './App.css';

function App() {
  const [sheetURL, setSheetURL] = useState('');
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [emailColumn, setEmailColumn] = useState('');
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [includeCommonMessage, setIncludeCommonMessage] = useState(false);
  const [commonMessage, setCommonMessage] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [sendAll, setSendAll] = useState(false);

  const [sendingStatus, setSendingStatus] = useState('');
  const [isSending, setIsSending] = useState(false);

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

    let start = rangeStart ? parseInt(rangeStart) : 1;
    let end = rangeEnd ? parseInt(rangeEnd) : data.length;

    if (sendAll) {
      start = 2;
      end = data.length;
    } else {
      if (start === 1) start = 2;
      if (isNaN(start) || start < 2 || start > data.length) {
        return alert(`Start range must be between 2 and ${data.length}`);
      }
      if (isNaN(end) || end < start || end > data.length) {
        return alert(`End range must be between ${start} and ${data.length}`);
      }
    }

    const sliceData = data.slice(start - 2, end);

    const finalData = sliceData.map(row => {
      let htmlParts = [];
      htmlParts.push(`<p><b>Email ID:</b> ${escapeHtml(row[emailColumn])}</p>`);
      selectedColumns.forEach(col => {
        if (col !== emailColumn) {
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

    setIsSending(true);
    setSendingStatus('');

    try {
      const res = await fetch('https://email-sender-app-yyiy.onrender.com/api/send-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      });
      const result = await res.json();
      if (result.status === 'success') {
        setSendingStatus(`✅ Emails sent! Count: ${finalData.length}`);
      } else {
        setSendingStatus('❌ Error sending some or all emails');
      }
    } catch (err) {
      console.error(err);
      setSendingStatus('❌ Network error sending emails');
    }

    setIsSending(false);
  };

  return (
    <div className="app-container">
      <h1 className="heading-premium">Email Sender via Google Sheet</h1>

      <div className="card">
        <label className="note-text">
          Note: Make sure your Google Sheet is set to <b>Public Access</b> or <b>Anyone with the link can view</b> before loading columns.
        </label>
        <input
          className="input-box"
          type="text"
          placeholder="Paste Google Sheet URL"
          value={sheetURL}
          onChange={e => setSheetURL(e.target.value)}
        />
        <button className="btn-primary" onClick={loadColumns} disabled={loadingColumns}>
          {loadingColumns ? 'Loading...' : 'Load Columns'}
        </button>
      </div>

      {columns.length > 0 && (
        <div className="card">
          <label className="label-spaced">Select Email column:</label>
          <select
            className="input-box spaced-select"
            value={emailColumn}
            onChange={e => setEmailColumn(e.target.value)}
          >
            <option value="">--Select Email Column--</option>
            {columns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>

          <label className="label-spaced">Select columns to include in message:</label>
          <div className="checkbox-container">
            {columns.map(col => (
              <label key={col} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(col)}
                  onChange={() => toggleColumn(col)}
                  disabled={col === emailColumn}
                />{' '}
                {col}
              </label>
            ))}
          </div>

          <label className="label-spaced">Email Subject:</label>
          <input
            className="input-box"
            type="text"
            value={emailSubject}
            placeholder="Enter Subject / Optional"
            onChange={e => setEmailSubject(e.target.value)}
          />

          <label className="checkbox-label bold-checkbox">
            <input
              type="checkbox"
              checked={includeCommonMessage}
              onChange={e => setIncludeCommonMessage(e.target.checked)}
            />{' '}
            Append a common message
          </label>

          {includeCommonMessage && (
            <textarea
              className="textarea-box"
              placeholder="Enter common message"
              value={commonMessage}
              onChange={e => setCommonMessage(e.target.value)}
            />
          )}

          <label className="checkbox-label bold-checkbox">
            <input
              type="checkbox"
              checked={sendAll}
              onChange={e => setSendAll(e.target.checked)}
            />{' '}
            Send to all rows
          </label>

          {!sendAll && (
            <div className="range-container">
              <input
                type="number"
                className="input-box"
                placeholder="Start row"
                value={rangeStart}
                onChange={e => setRangeStart(e.target.value)}
              />
              <input
                type="number"
                className="input-box"
                placeholder="End row"
                value={rangeEnd}
                onChange={e => setRangeEnd(e.target.value)}
              />
            </div>
          )}

          <button className="btn-primary" onClick={sendEmails} disabled={isSending}>
            Send Emails
          </button>

          {sendingStatus && (
            <div style={{ marginTop: '10px', fontWeight: 'bold', color: sendingStatus.startsWith("✅") ? "green" : "red" }}>
              {sendingStatus}
            </div>
          )}
        </div>
      )}

      {/* 📤 SENDING MODAL */}
      {isSending && (
        <div className="sending-modal">
          <div className="sending-box">
            <p>📤 Sending emails... Please wait</p>
          </div>
        </div>
      )}

      <footer className="footer">
        <p className="footer-text"><strong>Surya'S - Email Tool</strong></p>
        <div className="footer-icons">
          <a href="https://www.linkedin.com/in/suryas7203" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-linkedin-in"></i>
          </a>
          <a href="mailto:suryaskgmofficial.email@example.com">
            <i className="fas fa-envelope"></i>
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;








