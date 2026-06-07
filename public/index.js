fetch('https://raw.githubusercontent.com/karlozrilic/portfolio-proxy/refs/heads/master/README.md')
    .then(res => res.text())
    .then(text => {
        document.getElementById('content').innerHTML = marked.parse(text);
    });