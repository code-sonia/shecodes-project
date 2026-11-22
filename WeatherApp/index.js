const fallback = { name:"Accra", country:"Ghana", latitude:5.56, longitude:-0.2, current:{temperature_2m:28, apparent_temperature:30, relative_humidity_2m:74, wind_speed_10m:14, weather_code:0}, daily:{time:["2026-09-20","2026-09-21","2026-09-22","2026-09-23","2026-09-24"],weather_code:[0,2,61,3,80],temperature_2m_max:[31,30,29,28,29],temperature_2m_min:[25,25,24,24,25],sunrise:["06:02","06:02","06:02","06:01","06:01"],sunset:["18:10","18:10","18:09","18:09","18:09"]} };
    const $ = id => document.getElementById(id);
    const weather = code => code === 0 ? ["☀️","Clear skies"] : code <= 3 ? ["⛅","Partly cloudy"] : code < 60 ? ["🌫️","Hazy"] : code < 70 ? ["🌧️","Light rain"] : code < 80 ? ["🌨️","Snow showers"] : ["🌦️","Showers"];
    const day = date => new Date(date + "T12:00:00").toLocaleDateString("en-US",{weekday:"short"});
    function render(data, place) {
      const c = data.current, d = data.daily, [icon, label] = weather(c.weather_code);
      $("cityName").textContent = `${place.name}, ${place.country || ""}`.replace(/, $/,""); $("dateText").textContent = new Date().toLocaleDateString("en-US",{weekday:"long", month:"long", day:"numeric"});
      $("weatherIcon").textContent = icon; $("temperature").textContent = `${Math.round(c.temperature_2m)}°`; $("condition").textContent = label;
      $("hiLow").textContent = `H ${Math.round(d.temperature_2m_max[0])}° · L ${Math.round(d.temperature_2m_min[0])}°`;
      $("feels").textContent = `${Math.round(c.apparent_temperature)}°`; $("wind").textContent = `${Math.round(c.wind_speed_10m)} km/h`; $("humidity").textContent = `${c.relative_humidity_2m}%`;
      $("sunrise").textContent = formatTime(d.sunrise[0]); $("sunset").textContent = formatTime(d.sunset[0]);
      $("forecast").innerHTML = d.time.slice(0,5).map((date,i) => { const [iIcon] = weather(d.weather_code[i]); return `<article class="day"><div class="day-name">${i===0?"Today":day(date)}</div><div class="day-icon">${iIcon}</div><div class="day-temp">${Math.round(d.temperature_2m_max[i])}°</div><div class="day-low">${Math.round(d.temperature_2m_min[i])}°</div></article>`; }).join("");
      $("updated").textContent = "Updated just now";
    }
    const formatTime = value => { const [h,m] = value.split(":"); return new Date(2000,0,1,+h,+m).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}); };
    async function lookup(city) {
      $("status").textContent = "Finding weather…";
      try {
        const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`).then(r=>r.ok?r.json():Promise.reject());
        if (!geo.results?.length) throw Error("not found");
        const place = geo.results[0], data = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=5`).then(r=>r.ok?r.json():Promise.reject());
        render(data, place); $("status").textContent = ""; 
      } catch (e) { render(fallback, fallback); $("status").textContent = "Live data unavailable · showing Accra's latest saved outlook"; }
    }
    $("searchForm").addEventListener("submit", e => { e.preventDefault(); const city=$("cityInput").value.trim(); if(city) lookup(city); });
    const saved = localStorage.getItem("skyline-theme"); if(saved) document.documentElement.dataset.theme=saved;
    $("themeToggle").addEventListener("click", () => { const next=document.documentElement.dataset.theme==="light"?"dark":"light"; document.documentElement.dataset.theme=next; localStorage.setItem("skyline-theme",next); });
    render(fallback, fallback); lookup("Accra");