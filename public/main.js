const update = document.getElementById('update');

if (update) {
    update.addEventListener('click', () => {
        app.put('/quotes', (req, res) => {
            db.collection('quotes')
                .findOneAndUpdate({name: 'Yoda'}, {
                    $set: {
                        name: req.body.name,
                        quote: req.body.quote
                    }
                }, {
                    sort: {_id: -1},
                    upsert: true
                }, (err, result) => {
                    if (err) return res.send(err);
                    res.send(result)
                })
        })
            .then(res => {
                if (res.ok) return res.json();
            })
            .then(data => {
                console.log(data);
                window.location.reload(true)
            })
    });
}