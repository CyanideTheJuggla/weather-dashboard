const openWeatherAPIKey = '3248b4129513a60a8f4f5b72799aec86';
const geoApiUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=';
const oneCallApiUrl = 'https://api.openweathermap.org/data/2.5/onecall?';
const units = 'imperial';
const geoResultLimit = 5;

let fetchData;
let time;

const toggleMenuState = () => {
    const navMenu = $('.navMenu');
    (navMenu.attr('class').includes('closed')) ? 
        navMenu.addClass('open').removeClass('closed') :
        navMenu.removeClass('open').addClass('closed');
    const menuButtons = $('.menu');
    for(let i = 0; i < menuButtons.length; i++) {
        const element = $(menuButtons[i]);
        (element.attr('class').includes('menuOpen')) ?
            element.removeClass('menuOpen d-block').addClass('menuClosed d-none') :
            element.addClass('menuOpen d-block').removeClass('menuClosed d-none');
    };
    
}

const clock = () => {
    const currentTime = new Date().toLocaleTimeString();
    $('#currentTime').html(new Date().toLocaleTimeString());
}

function geoApi_GetLocation() {
    const locationString = ( $('.searchBox').val().length > 0 ) ? $('.searchBox').val() : 'Tampa';
    const requestUrl = geoApiUrl + locationString + '&limit=' + geoResultLimit + '&appid=' + openWeatherAPIKey;
    const request = new Request(requestUrl, {
        method: 'GET',
    });
    //console.log(requestUrl);
    //console.log(request);
    fetch(request)
    .then(response => {
        response.json()
            .then((data)=>{
                fetchData =  {
                    name: data[0].name, 
                    lat: data[0].lat,
                    lon: data[0].lon,
                    country: data[0].country 
                };
                oneCall_GetWeather(fetchData, '');
            });
    });
}
function oneCall_GetWeather(locationData, exclude) {
    const lat = locationData.lat;
    const lon = locationData.lon;
    const exclusions = (exclude.length > 0) ? exclude : '';
    const requestURL = oneCallApiUrl + 'lat=' + lat + '&lon=' + lon + '&units=' + units + '&appid=' + openWeatherAPIKey;
    const request = new Request(requestURL, {
        method: 'GET',
    });
    //console.log(requestURL);
    //console.log(request);
    fetch(request)
        .then(response => {
            response.json()
                .then(data=>{
                    console.log(data);
                    const weatherData = {
                        daily: data.daily, 
                        current: data.current
                    };
                    populateData(weatherData);
                });
        });
}
function populateData(weatherData) {
    const current = {
        temp: weatherData.current.temp,
        uv: weatherData.current.uv,
        humidity: weatherData.current.humidity,
        weather: weatherData.current.weather[0].main
    };
    const daily = [];
    for (let i = 0; i < 5; i++) {
        const element = weatherData.daily[i];
        console.log(element.temp.day);
        const dailyData = {
            temp: element.temp.day,
            //feelsLike: element.feelsLike.day,
            date: luxon.DateTime.now(),
            uv: element.uv,
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
    daily.forEach(element => {

        console.log(element.attributes)
        $('.card-group').html(element.toString());
    });
    //console.log('current', current);
    //console.log('daily', daily);
    
}

$(document).ready(()=>{
    $('.menu').click(toggleMenuState);
    $('#currentTime').html(new Date().toLocaleTimeString());
    time = setInterval(clock, 1000);
    
    //
});
$('#testLaunch').click(geoApi_GetLocation);
//.click(geoApi_GetLocation);//geoApi_GetLocation('Tampa');
//console.log()


/*


    <div class="card" data-day="1">
        <div class="card-body">
            <h6 class="card-title">Date</h6>
            <p class="card-text">
                <p>
                    <img class="weatherIcon" src="https://img.icons8.com/material-two-tone/24/000000/partly-cloudy-day--v1.png">
                    <span class="weatherText">Weather</span>
                </p>
                <p>
                    <img class="weatherTempIcon" src="https://img.icons8.com/material-two-tone/24/000000/thermometer.png">
                    <span class="weatherTemp">Temp</span>
                </p>
                <p>
                    <img class="weatherWindIcon" src="https://img.icons8.com/material-two-tone/24/000000/wind-gauge.png"/>
                    <span class="weatherWind">Wind</span>
                </p>
                <p>
                    <img class="weatherHumidityIcon" src="https://img.icons8.com/material-two-tone/24/000000/humidity.png"/>
                    <span class="weatherHumidity">Humidity</span>
                </p>
            </p>
        </div>
    </div>

*/