var separators = document.getElementById('separators');
var timebar = document.querySelector('#timebar');
var timeprogress = document.querySelector('.timeprogress');
var chipsdiv = document.querySelector('.chips');
var colorlist = document.querySelector('.colorlist');
var separatorshours = document.querySelector('#separators>.hours');
var separatorslines = document.querySelector('#separators>.lines');
const fraction = 0.00115740741;
separatorshours.style.gap = (fraction * 3600) + '%';
separatorslines.style.gap = (fraction * 3600) + '%';
var curractivity = 0;
var currwidth = 0;
var totalwidth = 0;
var totalsecs = 0;
const activities = localStorage.getItem('activities') ? JSON.parse(localStorage.getItem('activities')) : [];
var t = new Date('2020-01-01T00:00:00');

function save() {
    localStorage.setItem('activities', JSON.stringify(activities));
}



const hours = [
    '00:00',
    '01:00',
    '02:00',
    '03:00',
    '04:00',
    '05:00',
    '06:00',
    '07:00',
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
    '22:00',
    '23:00'
]
var marks = [{
        id: 0,
        duration: 44000
    }, {
        id: 1,
        duration: 20000
    },
    {
        id: 2,
        duration: 10000
    }
]

function renderparts() {
    timebar.innerHTML = '';
    for (var mark of marks) {
        var newprogress = document.createElement('div');
        newprogress.className = 'timeprogress';
        newprogress.style.width = fraction * mark.duration + '%';
        totalsecs += mark.duration;
        console.log(activities[mark.id]);
        newprogress.style.backgroundColor = activities[mark.id].color;
        timebar.appendChild(newprogress);
    }
    currwidth = fraction * mark.duration;
    timeprogress = newprogress;
    curractivity = mark.id;
    t.setSeconds(t.getSeconds() + totalsecs);
}

function createhourseparators() {
    for (i = 0; i < hours.length; i++) {
        var hoursep = document.createElement('div');
        hoursep.className = 'hoursep';
        hoursep.innerHTML = hours[i];
        separatorshours.appendChild(hoursep);
        var line = document.createElement('div');
        line.className = 'line';
        line.innerHTML = '|';
        separatorslines.appendChild(line);
    }
}

function allowDrop(ev) {
    ev.preventDefault();
    ev.stopPropagation();
}

function drag(ev) {
    ev.dataTransfer.setData("background", ev.target.style.backgroundColor);
}

function drop(ev) {
    ev.stopPropagation();

    ev.preventDefault();
    var data = ev.dataTransfer.getData("background");
    activities.push({
        name: "Text Here",
        duration: 2,
        color: data
    });
    ev.target.appendChild(chipc(activities.length - 1, data, "Text Here"));

}

function droponchip(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    var data = ev.dataTransfer.getData("background");
    console.log(data);
    activities[ev.target.id.split('-')[1]].color = data;
    ev.target.style.backgroundColor = data;
    ev.target.querySelector('p').style.color = iscolorlight(data) ? '#000000' : '#ffffff';
    save();
    renderparts();
}

const rgba2hex = (rgba) => `#${rgba.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)$/).slice(1).map((n, i) => (i === 3 ? Math.round(parseFloat(n) * 255) : parseFloat(n)).toString(16).padStart(2, '0').replace('NaN', '')).join('')}`

function iscolorlight(color) {
    color = color.includes('#') ? '#' + color : rgba2hex(color);
    const hex = color.replace('#', '');
    const c_r = parseInt(hex.substr(0, 2), 16);
    const c_g = parseInt(hex.substr(2, 2), 16);
    const c_b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;
    return brightness > 155;
}

function colorc(back, idnum) {
    var color = document.createElement('span');
    color.classList.add('color');
    color.setAttribute('draggable', 'true');
    color.setAttribute('ondragstart', 'drag(event)');
    color.id = 'color-' + idnum;
    color.style.backgroundColor = '#' + back;
    colorlist.appendChild(color);
}

function generateColors() {
    colorlist.innerHTML = '';
    for (i = 0; i < 10; i++) {
        var randomColor = Math.floor(Math.random() * 16777215).toString(16);
        colorc(randomColor, i);
    }
}

const adder = setInterval(function() {
    currwidth += fraction * 60;
    totalwidth += fraction * 60;
    marks[curractivity].duration += 1;
    timeprogress.style.width = currwidth + '%';
    if (totalwidth >= 100) {
        clearInterval(adder);
    }
}, 10);

for ([i, chip] of activities.entries()) {
    chipsdiv.appendChild(chipc(i, chip.color, chip.name));
}

function chipc(idnum, color, name) {
    var chipdiv = document.createElement('div');
    chipdiv.setAttribute('ondrop', 'droponchip(event)');
    chipdiv.setAttribute('ondragover', 'allowDrop(event)');
    chipdiv.id = 'chip-' + idnum;
    chipdiv.className = 'chip';
    chipdiv.style.backgroundColor = color;
    var chiptext = document.createElement('p');
    chiptext.innerHTML = name;
    chiptext.style.color = iscolorlight(color) ? '#000000' : '#ffffff';
    chiptext.addEventListener('click', function(event) {
        if (event.ctrlKey) {
            event.target.setAttribute('contenteditable', 'true');
        }
    });
    chiptext.addEventListener('focusout', function(event) {
        event.target.removeAttribute('contenteditable');
        activities[event.target.parentElement.id.split('-')[1]].name = event.target.innerHTML;
        save();
    });
    chipdiv.appendChild(chiptext);
    return chipdiv;
}




document.addEventListener('click', function(e) {
    if (e.target && e.target.id.includes('chip-')) {
        var chipid = e.target.id.split('-')[1];
        if (curractivity != chipid) {
            var newprogress = document.createElement('div');
            newprogress.className = 'timeprogress';
            newprogress.style.width = '0%';
            newprogress.style.backgroundColor = activities[chipid].color;
            currwidth = 0;
            timeprogress = newprogress;
            document.querySelector('#timebar').appendChild(newprogress);
            curractivity = chipid;
        }
    }
});



generateColors();
createhourseparators();
renderparts();