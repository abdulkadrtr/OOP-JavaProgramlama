function excelExport(){
    var xhr = new XMLHttpRequest();
    var urlParams = new URLSearchParams(window.location.search);
    var clickedBoxId = urlParams.get('clickedBoxId');
    const data = {
        clickedBoxId: clickedBoxId
    }
    xhr.open("POST", "http://localhost:8080/excelExport", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const messageElement = document.querySelector('.message');
            messageElement.innerHTML = 'Excel dosyası başarıyla oluşturuldu.';
        }
    };
    xhr.send(JSON.stringify(data));
}
function girisYap(){
    var urlParams = new URLSearchParams(window.location.search);
    var username = urlParams.get('username');
    window.location.href = "anasayfaAdmin.html?id="+username+"";
}
window.onload = function(){
    getSize();
}
function getSize(){
    var urlParams = new URLSearchParams(window.location.search);
    var clickedBoxId = urlParams.get('clickedBoxId');
    const data = {
        clickedBoxId: clickedBoxId
    }
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8080/getSize", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var max = JSON.parse(xhr.responseText);
            max = max.size
            getDatas(clickedBoxId,max);
        }
    };
    xhr.send(JSON.stringify(data));
}
function sendRequest(i, clickedBoxId, max) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:8080/getDatas", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            var data = {
                username: response.username,
                score: response.score,
                time: response.time
            };
            resolve(data);
            } else {
            reject(xhr.status);
            }
        }
        };
        var requestData = JSON.stringify({ "clickedBoxId": clickedBoxId, "index": i.toString() });
        xhr.send(requestData);
    });
    }

function displayData(data) {
    var table = document.getElementById("dataTable");

    data.forEach(obj => {
        var row = table.insertRow();
        var usernameCell = row.insertCell(0);
        var scoreCell = row.insertCell(1);
        var timeCell = row.insertCell(2);

        usernameCell.innerHTML = obj.username;
        scoreCell.innerHTML = obj.score;
        timeCell.innerHTML = obj.time;
    });
}
function drawChart(data) {
// Canvas elementini seçme
var canvas = document.getElementById("chartCanvas");
var context = canvas.getContext("2d");

// Grafik boyutları ve kenar boşlukları
var chartWidth = canvas.width - 70;
var chartHeight = canvas.height - 70;
var padding = 30;

// Veri sıralaması ve maksimum değerleri bulma
var sortedData = data.slice().sort(function(a, b) {
return a.score - b.score;
});
var maxValueX = sortedData[sortedData.length - 1].score;
var maxValueY = Math.max(...data.map(function(obj) {
return obj.time;
}));

// Grafik çizimi
context.clearRect(0, 0, canvas.width, canvas.height);
context.strokeStyle = "#d74426";
context.lineWidth = 2;
context.beginPath();

data.forEach(function(obj, index) {
var x = padding + (obj.score / maxValueX) * chartWidth;
var y = canvas.height - padding - (obj.time / maxValueY) * chartHeight;

if (index === 0) {
  context.moveTo(x, y);
} else {
  context.lineTo(x, y);
}

// Nokta çizimi
context.fillStyle = "#d74426";
context.beginPath();
context.arc(x, y, 4, 0, 2 * Math.PI);
context.fill();

// Nokta etiketi
context.fillStyle = "#fff";
context.font = "10px Arial";
context.textAlign = "center";
context.fillText(obj.username, x, y - 10);
context.fillText("Skor: " + obj.score, x, y + 20);
context.fillText("Zaman(sn): " + obj.time, x, y + 35);
});

context.stroke();

// Yatay ekseni çizimi
context.beginPath();
context.moveTo(padding, canvas.height - padding);
context.lineTo(canvas.width - padding, canvas.height - padding);
context.strokeStyle = "#5add08";
context.stroke();

// Dikey ekseni çizimi
context.beginPath();
context.moveTo(padding, padding);
context.lineTo(padding, canvas.height - padding);
context.stroke();

// Yatay eksen etiketi
context.fillStyle = "#fff";
context.font = "12px Arial";
context.textAlign = "center";
context.fillText("Skor", canvas.width / 2, canvas.height - 10);

// Dikey eksen etiketi
context.save();
context.translate(10, canvas.height / 2);
context.rotate(-Math.PI / 2);
context.fillText("Zaman (sn)", 0, 0);
context.restore();
}


function getDatas(clickedBoxId, max) {
    var promises = [];
    for (var i = 0; i < max; i++) {
        promises.push(sendRequest(i, clickedBoxId, max));
    }
    Promise.all(promises)
        .then(function(dataArray) {
        displayData(dataArray);
        drawChart(dataArray);
        })
        .catch(function(error) {
        console.log("İstek hatası: " + error);
        });
}