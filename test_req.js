fetch('https://wandbox.org/api/compile.json', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    compiler: 'go-1.23.2',
    code: 'package main\nimport "fmt"\nfunc main() {\n  fmt.Println("Hello")\n}'
  })
}).then(async r => console.log(r.status, await r.text()));
