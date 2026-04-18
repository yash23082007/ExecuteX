const fs = require('fs');
const file = 'client/src/components/TopNavigation.jsx';
let data = fs.readFileSync(file, 'utf8');

// Remove the useEffect auto-copying
data = data.replace(/useEffect\(\(\) => \{\s+if \(shareUrl\) \{\s+navigator\.clipboard\.writeText\(shareUrl\)\.then\(\(\) => \{\s+setCopied\(true\);\s+setTimeout\(\(\) => setCopied\(false\), 2000\);\s+\}\);\s+\}\s+\}, \[shareUrl\]\);/g, '');

// Replace the UI part
const shareUrlRenderStr = \{shareUrl && (
          <div className="share-toast">
            <span className="share-toast__text">Link copied to clipboard!</span>
            <button className="share-toast__close" onClick={clearShareState}><X size={12}/></button>
          </div>
        )}\;

const newShareUrlRenderStr = \{shareUrl && (
          <div className="share-toast" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              readOnly 
              value={shareUrl} 
              style={{ background: 'var(--ex-bg-2)', color: 'var(--ex-fg-1)', border: '1px solid var(--ex-border)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.85em', width: '180px' }} 
            />
            <button 
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              style={{ background: copied ? 'var(--ex-success)' : 'var(--ex-accent)', color: '#fff', border: 'none', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button className="share-toast__close" onClick={clearShareState} style={{ marginLeft: '4px' }}><X size={12}/></button>
          </div>
        )}\;

data = data.replace(shareUrlRenderStr, newShareUrlRenderStr);
fs.writeFileSync(file, data);
