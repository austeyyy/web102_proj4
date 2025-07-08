import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [currCity, setCurrCity] = useState(null);
  const [banned, setBanned] = useState([]);

  useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch countries list
  async function fetchCountries() {
    try {
      const options = {
        method: "GET",
        url: "https://wft-geo-db.p.rapidapi.com/v1/geo/countries",
        headers: {
          "X-RapidAPI-Key": import.meta.env.VITE_API_KEY,
          "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
        },
      };
      const response = await axios.request(options);
      setCountries(response.data.data);

      pickRandomCountryAndFetchCities(response.data.data, banned);
    } catch (err) {
      console.error("Error fetching countries", err);
    }
  }

  // Fetch cities for given country code
  async function fetchCitiesForCountry(countryCode) {
    try {
      const options = {
        method: "GET",
        url: "https://wft-geo-db.p.rapidapi.com/v1/geo/cities",
        params: { countryIds: countryCode, limit: 10 },
        headers: {
          "X-RapidAPI-Key": import.meta.env.VITE_API_KEY,
          "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
        },
      };
      const response = await axios.request(options);

      const data = response.data.data.map((c) => ({
        city: c.city,
        country: c.country,
        region: c.region,
        population: c.population,
        flag: `https://flagcdn.com/w320/${c.countryCode.toLowerCase()}.png`,
      }));

      setCities(data);
      pickRandomCity(data, banned);
    } catch (err) {
      console.error("Error fetching cities", err);
    }
  }

  const pickRandomCountryAndFetchCities = (countriesList, bannedCountries) => {
    const filteredCountries = countriesList.filter(
      (c) => !bannedCountries.includes(c.name)
    );
    if (filteredCountries.length === 0) {
      setCurrCity(null);
      return;
    }
    const randomCountry =
      filteredCountries[Math.floor(Math.random() * filteredCountries.length)];
    fetchCitiesForCountry(randomCountry.code);
  };

  const pickRandomCity = (citiesList, bannedCountries) => {
    const filtered = citiesList.filter(
      (c) => !bannedCountries.includes(c.country)
    );
    if (filtered.length === 0) {
      setCurrCity(null);
      return;
    }
    const randomCity = filtered[Math.floor(Math.random() * filtered.length)];
    setCurrCity(randomCity);
  };

  const handleCity = () => {
    pickRandomCountryAndFetchCities(countries, banned);
  };

  const toggleBan = (country) => {
    const updated = banned.includes(country)
      ? banned.filter((c) => c !== country)
      : [...banned, country];
    setBanned(updated);

    pickRandomCountryAndFetchCities(countries, updated);
  };

  return (
    <div className="container">
      <div>
        <h1>Travel the World 🌎</h1>
        <button onClick={handleCity} className="btn">
          Find City 🛫
        </button>

        {currCity ? (
          <div>
            <img src={currCity.flag} alt="flag" width={400} />
            <h2>{currCity.city}</h2>
            <p>Country: {currCity.country}</p>
            <p>Region: {currCity.region}</p>
            <p>Population: {currCity.population.toLocaleString()}</p>
            <button onClick={() => toggleBan(currCity.country)}>
              {" "}
              Ban Country
            </button>
          </div>
        ) : (
          <p>No cities available</p>
        )}
      </div>

      {/*Ban List*/}
      <div className="ban-col">
        <h2>Ban List (Click Country to Unban)</h2>

        <ul>
          {banned.map((c) => (
            <div className="ban-list" key={c} onClick={() => toggleBan(c)}>
              {c} ❌
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
