import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useUrlLocation from "../../hooks/useUrlLocation";
import axios from "axios";
import Loader from "../Loader/Loader";
import ReactCountryFlag from "react-country-flag";
import { useBookmark } from "../context/BookmarkListContext";

const BASE_URL_GEOLOCATION =
  "https://api.bigdatacloud.net/data/reverse-geocode-client";

function AddNewBookmark() {
  const navigate = useNavigate();
  const handleBack = (e) => {
    e.preventDefault();
    navigate(-1);
  };
  const [lat, lng] = useUrlLocation();
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [isLoadnigGeoCoding, setIsLoadingGeoCoding] = useState(false);
  const [errorGeoCoding, setErrorGeoCoding] = useState(null);
  const { createBookmark } = useBookmark();

  useEffect(() => {
    if ((!lat, !lng)) return;
    async function fetchLocationData() {
      setIsLoadingGeoCoding(true);
      setErrorGeoCoding(null);
      try {
        const { data } = await axios.get(
          `${BASE_URL_GEOLOCATION}?latitude=${lat}&longitude=${lng}`
        );
        if (!data.countryCode)
          throw new Error(
            "This location is not a city please click somewhere else"
          );
        setCityName(data.city || data.locality || "");
        setCountry(data.countryName);
        setCountryCode(data.countryCode);
      } catch (error) {
        setErrorGeoCoding(error.message);
      } finally {
        setIsLoadingGeoCoding(false);
      }
    }
    fetchLocationData();
  }, [lat, lng]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cityName || !country) return;
    const newBookmark = {
      cityName,
      country,
      countryCode,
      latitude: lat,
      longitude: lng,
      host_location: cityName + "" + country,
    };
    await createBookmark(newBookmark);
    navigate("/bookmark");
  };

  if (isLoadnigGeoCoding) return <Loader />;
  if (errorGeoCoding) return <strong>{errorGeoCoding}</strong>;
  return (
    <div>
      <h2>Bookmark New Location</h2>
      <form className="form" onSubmit={handleSubmit}>
        <div className="formControl">
          <label htmlFor="cityName">CityName</label>
          <input
            value={cityName}
            type="text"
            name="cityName"
            id="cityName"
            onChange={(e) => setCityName(e.target.value)}
          />
        </div>
        <div className="formControl">
          <label htmlFor="country">Country</label>
          <input
            value={country}
            type="text"
            name="country"
            id="country"
            onChange={(e) => setCountry(e.target.value)}
          />

          <ReactCountryFlag className="flag" svg countryCode={countryCode} />
        </div>
        <div className="buttons">
          <button onClick={handleBack} className="btn btn--back">
            &larr; Back
          </button>
          <button className="btn btn--primary"> Add </button>
        </div>
      </form>
    </div>
  );
}

export default AddNewBookmark;
