// test_api.js
fetch("http://localhost:3001/api/v1/compile", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    language: "java",
    code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from API test!");
    }
}`
  })
}).then(r => r.json()).then(res => console.log("\\nAPI RESULT:", JSON.stringify(res, null, 2)))
.catch(err => console.error("FETCH ERROR:", err));
