const fs = require('fs');
const file = 'client/src/components/TopNavigation.jsx';
let data = fs.readFileSync(file, 'utf8');
data = data.replace(
  /<div className="fsize">[\s\S]*?<\/div>/,
  '<div className="fsize" title="Font Size">\n          <span style={{ fontSize: "0.75em", marginRight: "6px", opacity: 0.7, fontWeight: 600 }}>A</span>\n          <button className="fsize__btn" onClick={() => setFontSize(fontSize - 1)}><Minus size={11} /></button>\n          <span className="fsize__val">{fontSize}</span>\n          <button className="fsize__btn" onClick={() => setFontSize(fontSize + 1)}><Plus size={11} /></button>\n          <span style={{ fontSize: "1.1em", marginLeft: "6px", opacity: 0.7, fontWeight: 600 }}>A</span>\n        </div>'
);
fs.writeFileSync(file, data);
