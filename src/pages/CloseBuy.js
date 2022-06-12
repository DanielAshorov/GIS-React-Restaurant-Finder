import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import './CloseBuy.css'
var markers = [];
export default function CloseBuy() {
    const [address, setAddress] = useState("");
    const [error, setError] = useState("");
    const [spinner, setSpinner] = useState(false);
    const [lat, setLat] = useState(0);
    const [lng, setLng] = useState(0);
    const [type, setType] = useState("-1");
    const [radius, setRadius] = useState("-1");
    const [places, setPlaces] = useState([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [apiKey, setApiKey] = useState('EnterYourGoogleKeyHere');
    const google = window.google;
    const autocompleteRef = useRef(null);
    const mapRef = useRef(null);

    const locatorButtonPressed = (e) => {

        e.preventDefault();
        setSpinner(true);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLat(position.coords.latitude);
                    setLng(position.coords.longitude);
                    getAddressFrom(
                        position.coords.latitude,
                        position.coords.longitude
                    );

                    showLocationOnTheMap(
                        position.coords.latitude,
                        position.coords.longitude
                    );
                },
                (error) => {

                    setError("Locator is unable to find your address. Please type your address manually.")
                    setSpinner(false);
                }
            );
        } else {
            setError(error.message);
            setSpinner(false);
            console.log("Your browser does not support geolocation API ");
        }

    }

    const getAddressFrom = (lat, long) => {
        axios
            .get(
                "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
                lat +
                "," +
                long +
                "&key=EnterYourGoogleKeyHere"
            )
            .then((response) => {
                if (response.data.error_message) {

                    setError(response.data.error_message);
                    console.log(response.data.error_message);
                } else {
                    setAddress(response.data.results[0].formatted_address);
                }
                setSpinner(false);
            })
            .catch((error) => {
                setError(error.message);
                setSpinner(false);
                console.log(error.message);
            });
    }

    const showLocationOnTheMap = (latitude, longitude) => {
        // Show & center the Map based oon
        var map = new google.maps.Map(mapRef.current, {
            zoom: 15,
            center: new google.maps.LatLng(latitude, longitude),
            mapTypeId: google.maps.MapTypeId.ROADMAP,
        });

        new google.maps.Marker({
            position: new google.maps.LatLng(latitude, longitude),
            map: map,
        });
    }

    const findClosestHamburgerPlacesButtonPressed = (e) => {
        e.preventDefault();
        if (radius === "-1" || type === "-1") {
            alert("Please select radius and type");
            return;
        }

        const URL = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat
            },${lng}&type=${type}&radius=${radius * 1000}&key=${apiKey
            }`;

        axios
            .get(URL)
            .then((response) => {
                setPlaces(response.data.results);

                console.log(response);
            })
            .catch((err) => {
                setError(err.message);
            });
    }
    useEffect(() => {
        if (places.length > 0) {
            showPlacesOnMap();
        }
    }, [places])
    const showPlacesOnMap = () => {
        let map = new google.maps.Map(mapRef.current, {
            zoom: 15,
            center: new google.maps.LatLng(lat, lng),
            mapType: google.maps.MapTypeId.ROADMAP,
        });
        markers = [];
        const infowindow = new google.maps.InfoWindow();
        // let _markers = [...markers];
        for (let i = 0; i < places.length; i++) {
            const lat = places[i].geometry.location.lat;
            const lng = places[i].geometry.location.lng;
            const placeID = places[i].place_id;

            let marker = new google.maps.Marker({
                position: new google.maps.LatLng(lat, lng),
                map: map,
            });

            markers.push(marker);

            google.maps.event.addListener(marker, "click", () => {
                const URL = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?key=${apiKey}&place_id=${placeID}`;

                axios
                    .get(URL)
                    .then((response) => {
                        if (response.data.error_message) {
                            setError(response.data.error_message);
                        } else {
                            const place = response.data.result;

                            infowindow.setContent(
                                `<div class="ui header">${place.name}</div>
                    ${place.formatted_address} <br>
                    ${place.formatted_phone_number} <br>
                    <a href="${place.website}" target="_blank">${place.website}</a>
                    
                    `
                            );
                            infowindow.open(map, marker);
                        }
                    })
                    .catch((error) => {
                        setError(error.message);
                    });
            });
        }
        console.log(markers);
        // setMarkers(_markers);
    }

    const showInfoWindow = (index) => {
        setActiveIndex(index);
        new google.maps.event.trigger(markers[index], "click");
    }
    useEffect(() => {
        var autocomplete = new google.maps.places.Autocomplete(
            autocompleteRef.current,
            {
                bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(45.4215296, -75.6971931)
                ),
            }
        );

        autocomplete.addListener("place_changed", () => {
            var place = autocomplete.getPlace();

            setAddress(place.formatted_address);
            setLat(place.geometry.location.lat());
            setLng(place.geometry.location.lng());
        });


    }, [google]);

    return (
        <div className="ui grid">
            <div className="six wide column">
                <form className="ui segment large form">
                    {error && <div className="ui message red" >{error}</div>}
                    <div className="ui segment">
                        <div className="field">
                            <div
                                className={spinner ? "ui right icon input large loading" : "ui right icon input large"}>
                                <input
                                    type="text"
                                    placeholder="Enter your address"
                                    onChange={(e) => { setAddress(e.target.value) }}
                                    value={address}
                                    ref={autocompleteRef}

                                />
                                <i className="dot circle link icon" onClick={locatorButtonPressed} ></i>
                            </div>
                        </div>
                        <div className="field">
                            <div className="two fields">
                                <div className="field">
                                    <select value={type} onChange={(e) => { setType(e.target.value) }} >
                                        <option value="-1"> Please select </option>
                                        <option value="restaurant">Restaurant</option>
                                    </select>
                                </div>
                                <div className="field">
                                    <select value={radius} onChange={(e) => { setRadius(e.target.value) }}>
                                        <option value="-1"> Please select </option>
                                        <option value="5">5KM</option>
                                        <option value="10">10KM</option>
                                        <option value="15">15KM</option>
                                        <option value="20">20KM</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <button
                            className="ui button"
                            onClick={findClosestHamburgerPlacesButtonPressed}
                        >
                            Find Closest Hamburger Places
                        </button>
                    </div>
                </form>

                <div className="ui segment" style={{ maxhieght: "350px", overflow: "auto" }}>
                    <div className="ui divided items">
                        {places.map((place, index) =>
                            <div
                                onClick={() => { showInfoWindow(index) }}
                                key={index}
                                className={activeIndex === index ? 'item active' : 'item'}
                                style={{ padding: "10px" }}
                            >

                                <div className="content">
                                    <div className="header">{place.name}</div>
                                    <div className="meta">{place.vicinity}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="ten wide column" ref={mapRef} ></div>
        </div>
    )
}