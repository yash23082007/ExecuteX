// test_py.js
fetch("http://localhost:3001/api/v1/compile", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    language: "python",
    code: "print('hello from python API')"
  })
}).then(r => r.json()).then(res => console.log("\\nAPI RESULT:", JSON.stringify(res, null, 2)))
.catch(err => console.error("FETCH ERROR:", err));
