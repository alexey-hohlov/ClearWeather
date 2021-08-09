// Константы и переменные
const APIKEY = '7a36755e86db6efcc926a891f3a40e6f';

// Селекторы
const input = document.querySelector('.citySelect');
const submit = document.querySelector('.submitBtn');
const currentWeather = document.querySelector('.currentWeather');
const forecast = document.querySelector('.forecast');

// Обработчики событий
window.addEventListener('load', displayWeather);
submit.addEventListener('click', displayWeather);


let request = {
   url : 'http://api.openweathermap.org/data/2.5/',
   key : APIKEY,
   city : input.value,
   lang : 'RU',
   lat: 55.0411,
   lon: 82.9344,
   offset: 25200
};

// Получаем данные по текущему состоянию
async function getCurrentData(){

   request.city = input.value;

   const response = await fetch(`${request.url}weather?q=${request.city}&appid=${request.key}&lang=${request.lang}`);
   const data = await response.json();

   request.lat = data.coord.lat;
   request.lon = data.coord.lon;
   //request.offset = 

   return data;   
}

// Получаем данные прогноза по координатам
async function getForecastData(){

   const response = await fetch(`${request.url}onecall?lat=${request.lat}&lon=${request.lon}&appid=${request.key}&lang=${request.lang}`);
   const data = await response.json();

   request.offset = data.timezone_offset;

   return data;
}

// Вывод данных текущей погоды на страницу
async function displayWeather(){
   try{
      const data = await getCurrentData();

      let unix = data.dt;
      let date = unixTimeConverter(unix);

      let markup = `<div class="cityName">${data.name}</div>
                     <div class="currentDate">${date.weekDay}, ${date.day} ${date.month}</div>
                     <div class="currentTemp">${Math.round(data.main.temp - 273)}&degC</div>
                     <img class='currentIcon' src='./icons/${data.weather[0]['icon']}.svg'>
                     <div class="description">${data.weather[0].description.toUpperCase()}</div>
                     <div class="additional">скорость ветра ${Math.round(data.wind.speed)}
                     м/с, ощущается как ${Math.round(data.main.feels_like - 273)}&degC</div>`

      currentWeather.innerHTML = markup;
      displayForecast();
   }
   catch{

      removeForecast();

      markup = `<div class="cityName">???</div>
               <div class="currentTemp"></div>
               <img class="currentIcon" src="./icons/unknown.svg">
               <div class="description">Город не найден</div>
               <div class="additional"></div>`;

      currentWeather.innerHTML = markup;
   }
}

// Вывести прогноз погоду на страницу
async function displayForecast(){
   const data = await getForecastData();

   removeForecast();

   let i = 1;
   let length = data.daily.length;

   // Если смещение отрицательное - цикл перебирается с нуля
   if(request.offset < 0 ){i = 0; length = length - 1};

   while(i < length){
      let forecastItem = document.createElement('div');
      forecastItem.classList = 'forecastItem';

      let unix = data.daily[i].dt;
      let date = unixTimeConverter(unix);

      let markup = `<p class="forecastDate">${date.weekDay}<br>${date.day} ${date.month}</p>
      <img class='forecastIcon' src='./icons/${data.daily[i].weather[0]['icon']}.svg'>
      <p class="forecastTemp">${Math.round(data.daily[i].temp.day - 273)}&degC</p>`;

      forecastItem.innerHTML = markup;
      forecast.appendChild(forecastItem);

      i++;
   }
}

// Конвертируем timestamp
function unixTimeConverter(unix){
   let dt = new Date(unix * 1000);
   
   let days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 
                  'Пятница', 'Суббота'];

    let month = ['января', 'февраля', 'марта', 'апреля', 
                     'мая', 'июня', 'июля', 'августа', 
               'сентября', 'октября', 'ноября', 'декабря'];

   let date = {
      weekDay: days[dt.getDay()],
      day: dt.getDate(),
      month : month[dt.getMonth()]
   }

   return date;
}

//Удалить карточки прогноза
function removeForecast(){
   let item = document.querySelectorAll('.forecastItem');

   for(let k = 0; k < item.length; k++){
      item[k].remove();
   }   
}