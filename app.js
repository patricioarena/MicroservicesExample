const express = require('express');
const request = require('request');
const bodyParser = require('body-parser')
const port = 3000;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


function getFirstData(value) {
    return new Promise((resolve, reject) => {
        request(`https://randomuser.me/api/1.0/?seed=${value}`, { json: true }, (err, res) => {
            if (err) {
                reject(err)
            } else {
                resolve(res.body.results);
            }
        });
    });
}

//   wellington
function getSecondaryData(state) {
    return new Promise((resolve, reject) => {
        request(`https://restcountries.eu/rest/v2/capital/${state}`, { json: true }, (err, res) => {
            if (err) {
                reject(err)
            } else {
                resolve(res.body);
            }
        });
    });
}

async function getAll(value) {

    var tabla1 = [];
    var tabla2 = [];
    var tabla3 = [];

    await getFirstData(value).then(result => {
        let tabla = JSON.parse(JSON.stringify(result))
        tabla = tabla.map((user) => ({

            Picture: user.picture.large,
            Name: user.name.first,
            Last: user.name.last,
            State: user.location.state,
            Nat: user.nat

        }));
        // console.log(tabla)
        tabla1 = tabla;
    });

    //   console.log(tabla1)
    var temp = JSON.parse(JSON.stringify(tabla1[0]))
    //   console.log(temp.State)

    await getSecondaryData(temp.State).then(result => {
        let tabla = JSON.parse(JSON.stringify(result))
        tabla = tabla.map((info) => ({

            Alpha2Code: info.alpha2Code,
            Name: info.name,
            Flag: info.flag

        }));
        // console.log(tabla)
        tabla2 = tabla;
    });

    if (tabla1.Nat === tabla2.Alpha2Code) {
        tabla3 = [...tabla1, ...tabla2];
        let outString = JSON.stringify(tabla3).replace(/[\{\}\[\]]/gi, '');
        // console.log(tabla3);
        let arr = JSON.parse('{' + outString + '}');
        // console.log(arr);
        return Promise.resolve(arr);
    }

}

app.get('/ts', (req, res) => {
    getAll('ts').then(val => {
        console.log(val);
        res.send(val);
    });
});

app.get('/eu', (req, res) => {
    getAll('eu').then(val => {
        console.log(val);
        res.send(val);
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`)
});
