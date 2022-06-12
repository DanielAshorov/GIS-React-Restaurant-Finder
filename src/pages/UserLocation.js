import { useEffect, useRef, useState } from "react";
import './UserLocation.css'
import axios from 'axios'
export default function UserLocation() {
    const google = window.google;
    const autocompleteRef = useRef(null);
    const mapRef = useRef(null);
    const [spinner, setSpinner] = useState(false);
    const [error, setError] = useState('');
    const [address, setAddress] = useState('');

    //Current Location Button
    const locationButtonPressed = (e) => {

        e.preventDefault();
        setSpinner(true);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
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
    ////////////////////////////////

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

    //AutoComplete 
    useEffect(() => {
        var autocomplete = new google.maps.places.Autocomplete(
            autocompleteRef.current,
            {
                bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(45.4215296, -75.6971931)
                ),
            }
        );
        let _showLocationOnTheMap = (latitude, longitude) => {
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
        autocomplete.addListener("place_changed", () => {
            var place = autocomplete.getPlace();

            _showLocationOnTheMap(
                place.geometry.location.lat(),
                place.geometry.location.lng()
            );
        });


    }, [google]);

    return (
        <div>
            <section
                className="ui two column centered grid"
                style={{ position: "relative", zIndex: 1 }}
            >
                <div className="column">
                    <form className="ui segment large form">
                        {error && <div className="ui message red" >{error}</div>}

                        <div className="ui segment">
                            <div className="field">
                                <div
                                    className={spinner ? "ui right icon input large loading" : "ui right icon input large"}

                                >
                                    <input
                                        type="text"
                                        placeholder="Enter your address"
                                        onChange={(e) => { setAddress(e.target.value) }}
                                        value={address}
                                        ref={autocompleteRef}
                                    />
                                    <i
                                        className="dot circle link icon"
                                        onClick={locationButtonPressed}
                                    ></i>
                                </div>
                            </div>
                            <button className="ui button">Go</button>
                        </div>
                    </form>
                </div>
            </section >

            <section id="map" ref={mapRef}></section>
        </div >
    )
}