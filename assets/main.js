const openWeatherAPIKey = '3248b4129513a60a8f4f5b72799aec86';
const geoApiUrl = 'https://api.openweathermap.org/geo/1.0/direct?q=';
const oneCallApiUrl = 'https://api.openweathermap.org/data/2.5/onecall?';
const units = 'imperial';
const geoResultLimit = 5;

let locationString = '';
let fetchData;
let charactersEntered = 0;
let time;
let anim;

const showError = (errorMessage) => {
    const errorPanel = $('.alert-danger');
    errorPanel.text(errorMessage);
    errorPanel.animate({
        opacity: 1
    }, 300);
    anim = setTimeout(()=>{
        const errorPanel = $('.alert-danger');
        errorPanel.animate({
            opacity: 0
        }, 300);
    }, 3000)
    
}

function directionFromDegrees (degrees)  {
    degrees = Number.parseFloat(degrees);
    //console.log(degrees);
    if (degrees >= 0 && degrees <= 20) return 'N';
    if (degrees > 20 && degrees <= 70) return 'NE';
    if (degrees > 70 && degrees <= 110) return 'E';
    if (degrees > 110 && degrees <= 160) return 'SE';
    if (degrees > 160 && degrees <= 200) return 'S';
    if (degrees > 200 && degrees <= 270) return 'SW';
    if (degrees > 290 && degrees <= 340)  return 'W';
    if (degrees > 290 && degrees <= 340)  return 'NW';
    if (degrees > 340 && degrees <= 360)  return 'N';
}

const clock = () => {
    const currentTime = new Date().toLocaleTimeString();
    $('#currentTime').html(currentTime);
}

function geoApi_GetLocation(location, isSearchHistory) {
    let temp = $('.searchBox').val();
    temp = ((location!= null && location != '') ? 
            location : ((temp != null && temp != '') ? 
                temp : 
                'ALL BAD'
            )
        );
    if(locationString.length > 0 ) {
        const requestUrl = geoApiUrl + locationString + '&limit=' + geoResultLimit + '&appid=' + openWeatherAPIKey;
        const request = new Request(requestUrl, {
            method: 'GET',
        });
        try{
            fetch(request)
            .then(response => {
                response.json()
                    .then((data)=>{
                        //console.log(data);
                        if(data.length > 0){
                            fetchData =  {
                                name: data[0].name, 
                                lat: data[0].lat,
                                lon: data[0].lon
                            };
                            oneCall_GetWeather(fetchData, isSearchHistory);
                        } else return;
                    });
            });
        } catch (err){
            showError(err)
        }
        
    } else console.log('Problem!: (locationString.length > 0 ): ', (locationString.length > 0 ));
}

function storePreviousSearch(card, isSearchHistory, elementName){
    card.setAttribute('data-string', elementName);
    const searchButton = document.createElement('button');
    searchButton.className = 'btn btn-primary searchButton';
    searchButton.setAttribute('data-search', 'history');
    searchButton.setAttribute('data-string', elementName);
    searchButton.textContent = 'Search again';
    
    card.appendChild(searchButton);

    if($('.searchHistory .card[data-string="' + elementName + '"]').length > 0) {
        console.log('selection: ' + elementName);
        console.log($('.searchHistory .card[data-string="' + elementName + '"]:not(:only-child)'));
        $('.searchHistory .card[data-string="' + elementName + '"]:not(:only-child)').remove();
    }

    $('.searchHistory').prepend(card);
    if ($('.searchHistory').children().length > 5) $('.searchHistory .card:last-child').remove();
    const selector = '.searchHistory .card[data-string="' + elementName + '"] h6';
    console.log(elementName);
    $(selector).text(elementName);
    if(!isSearchHistory){
        storage = JSON.parse(localStorage.getItem('pastSearches'));
        if (storage == undefined || storage == null)  storage = [];
        storage.push({locationString: elementName})
        if (storage.length > 5) storage.pop();
        localStorage.setItem('pastSearches', JSON.stringify(storage));
    }
}

function oneCall_GetWeather(locationData, isSearchHistory) {
    //console.log(locationData);
    charactersEntered = 0;
    const lat = locationData.lat;
    const lon = locationData.lon;
    const requestURL = oneCallApiUrl + 'lat=' + lat + '&lon=' + lon + '&units=' + units + '&appid=' + openWeatherAPIKey;
    const request = new Request(requestURL, {
        method: 'GET',
    });
    fetch(request)
        .then(response => {
            if(response.ok){
                response.json()
                .then(data=>{
                    console.log(locationData);
                    const weatherData = {
                        name: locationData.name,
                        daily: data.daily, 
                        current: data.current
                    };
                    populateData(weatherData, isSearchHistory);
                });
            }
        });
}

function populateData(weatherData, isSearchHistory) {
    $('.card-group').html('');
    console.log(weatherData);
    const current = {
        name: weatherData.name,
        date: luxon.DateTime.now().toLocaleString(),
        temp: weatherData.current.temp,
        uv: weatherData.current.uvi,
        humidity: weatherData.current.humidity,
        weather: weatherData.current.weather[0].main,
        wind: 
        {
                deg:   weatherData.current.wind_deg,
                gust:  weatherData.current.wind_gust,
                speed: weatherData.current.wind_speed
        },
        location: locationString
    };
    addCard(current, false, isSearchHistory);
    const daily = [];
    for (let i = 0; i < 5; i++) {
        const element = weatherData.daily[i];
        const date = luxon.DateTime.local().plus({days: i + 1});
        const dailyData = {
            name: weatherData.name,
            temp: element.temp.day,
            date: date.toLocaleString(),
            uv: element.uvi,
            humidity: element.humidity,
            weather: element.weather[0].main,
            wind: {
                deg:   element.wind_deg,
                gust:  element.wind_gust,
                speed: element.wind_speed
            }
        };
        daily.push(dailyData);
    }
    if(!isSearchHistory){
        daily.forEach(element => {
            addCard(element, true, false);
        });
    }
}

function addCard(element, isDaily, isSearchHistory){
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';

    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'card-body';

    const cardTitle = document.createElement('h6');
    cardTitle.className = 'card-title';
    cardTitle.textContent = (element.date == luxon.DateTime.now().toLocaleString()) ? "Now: " + element.date + ' - ' + $('#currentTime').html() : element.date;
    
    const containmentP = document.createElement('p');
    containmentP.className = 'card-text';
    
    const weatherP = document.createElement('p');
    const weatherIcon = document.createElement('img');
    const weatherText = document.createElement('span');
    weatherIcon.setAttribute('src', 'https://img.icons8.com/material-two-tone/24/000000/partly-cloudy-day--v1.png');
    weatherText.textContent = element.weather;
    weatherText.className += 'ml-2'

    const tempP = document.createElement('p');
    const tempIcon = document.createElement('img');
    const tempText = document.createElement('span');
    tempIcon.setAttribute('src', 'https://img.icons8.com/material-two-tone/24/000000/thermometer.png');
    tempText.textContent = element.temp + 'ºF';
    tempText.className += 'ml-2'

    const windP = document.createElement('p');
    const windIcon = document.createElement('img');
    const windText = document.createElement('span');
    const windString = element.wind.speed + ' Mph ' + directionFromDegrees(element.wind.deg) ;
    windIcon.setAttribute('src', 'https://img.icons8.com/material-two-tone/24/000000/wind-gauge.png');
    windText.textContent = windString;
    windText.className += 'ml-2'

    const humidityP = document.createElement('p');
    const humidityIcon = document.createElement('img');
    const humidityText = document.createElement('span');
    humidityIcon.setAttribute('src', 'https://img.icons8.com/material-two-tone/24/000000/humidity.png');
    humidityText.textContent = element.humidity + '%';
    humidityText.className += 'ml-2'

    const uvP = document.createElement('p');
    const uvIcon = document.createElement('img');
    const uvText = document.createElement('span');
    uvIcon.setAttribute('src', 'https://img.icons8.com/external-justicon-lineal-justicon/64/000000/external-uv-index-weather-justicon-lineal-justicon-1.png');
    uvIcon.setAttribute('style', 'width: 24px; height: 24px');
    uvText.textContent = 'UVI: ' + element.uv;
    uvText.className += 'ml-2'

    weatherP.appendChild(weatherIcon);
    weatherP.appendChild(weatherText);
    
    tempP.appendChild(tempIcon);
    tempP.appendChild(tempText);
    
    windP.appendChild(windIcon);
    windP.appendChild(windText);
    
    humidityP.appendChild(humidityIcon);
    humidityP.appendChild(humidityText);

    uvP.appendChild(uvIcon);
    uvP.appendChild(uvText);

    containmentP.appendChild(weatherP);
    containmentP.appendChild(tempP);
    containmentP.appendChild(windP);
    containmentP.appendChild(humidityP);
    containmentP.appendChild(uvP);
    
    bodyDiv.appendChild(cardTitle);
    bodyDiv.appendChild(containmentP);
    
    cardDiv.appendChild(bodyDiv);
    const cardClone = cardDiv.cloneNode(true);
    
    if(isDaily && !isSearchHistory) {
        $('.daily').append(cardDiv);
    }
    
    if(!isDaily && !isSearchHistory) {
        $('.lead').html(cardDiv);
        $('.cityName').text(element.name);
        storePreviousSearch(cardClone, false, element.name);
    }
    
    if (isSearchHistory && !isDaily) {
        //console.log('isSearchHistory | !isDaily: ' + isSearchHistory + " | " + isDaily );
        console.log(element.name);
        storePreviousSearch(cardClone, true, element.name);
    }

}

function autoFill(){
    $('.searchTermBox').html('');
    const currentEntry = $('.searchBox').val();
    if (currentEntry) {
        const requestUrl = geoApiUrl + currentEntry + '&limit=' + geoResultLimit + '&appid=' + openWeatherAPIKey;
        const request = new Request(requestUrl, {
            method: 'GET',
        });
        fetch(request)
        .then(response => {
            if(response.ok){
                response.json()
                    .then((data)=>{
                        console.log(data.state);
                        const fetchData = [];
                        data.forEach(element => {
                            fetchData.push({
                                name: element.name, 
                                lat: element.lat,
                                lon: element.lon,
                                state: (element.state) ? element.state + ', USA' : element.country
                            });
                        });
                        populateAutoFill(fetchData);
                    }
                );
            } else {
                //console.log('Problem!');
                //console.log('response.status', response.status);
                //console.log('response.statusText', response.statusText);
                showError(response.statusText);
            }
        });
    }
}

function populateAutoFill(fetchData){
    for (let i = 0; i < fetchData.length; i++) {
        const element = fetchData[i];
        const fillData = document.createElement('li');
        fillData.textContent = element.name + ', ' + element.state;
        fillData.className = 'list-group-item searchOpt';
        fillData.setAttribute('data-lat', element.lat);
        fillData.setAttribute('data-lon', element.lon)
        $('.searchTermBox').append(fillData);
        
    }
}

function citySearchInput(event) {
    if(event.keyCode == 13) {
        if($(event.target).val().length > 3 && $('.searchTermBox').children().length > 0){
            $('.searchTermBox').children()[0].click();
        }
    }
    else if(!(event.altKey || event.ctrlKey || event.shiftKey) & $(event.target).val().length > 3){
        autoFill();
    } else if(event.ctrlKey) autoFill();
}

function autoSearch(event) {
    locationString = $(event.target).html();
    $('#searchCity').val($(event.target).html())
    console.log(locationString);
    const locDat = {
        name: locationString,
        lat: event.target.dataset.lat,
        lon: event.target.dataset.lon
    }
    oneCall_GetWeather(locDat);
    $('.searchTermBox').html('').blur();
}

function reSearch(e){
    console.log(e.target);
    locationString = e.target.dataset.string;
    console.log('locationString', locationString);
    geoApi_GetLocation(locationString, false);
}

function loadStored(){
    storageObj = JSON.parse(localStorage.getItem('pastSearches'));
    //console.log(storageObj);
    if (storageObj != null) {
        for (let i = 0; i < storageObj.length; i++) {
            const element = storageObj[i];
            if(element.locationString){
                locationString = element.locationString;
                geoApi_GetLocation(element.locationString, true);
            }
        }
    } else return;
}

$(document).ready(()=>{
    //$('.menu').click(toggleMenuState);
    $('#searchMain').click(autoSearch);
    $('#searchCity').on('keyup', citySearchInput);
    $('#searchCity').on('blur', ()=> { setTimeout(() => { $('.searchTermBox').html(''); }, 500) });
    $('.searchHistory').on('click', 'button.searchButton', reSearch);
    $('ul.searchTermBox').on('click', 'li.searchOpt', autoSearch);
    $('#currentTime').html(new Date().toLocaleTimeString());
    time = setInterval(clock, 1000);
    loadStored();
});

