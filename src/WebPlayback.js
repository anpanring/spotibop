import React, { useState, useEffect } from "react";
import Playlists from './Playlists';
import './WebPlayback.css';

const track = {
    name: "",
    album: {
        images: [
            { url: "" }
        ]
    },
    artists: [
        { name: "" }
    ]
};

function WebPlayback({ token }) {

    const [player, setPlayer] = useState(undefined);
    const [is_paused, setPaused] = useState(false);
    const [is_active, setActive] = useState(false);
    const [current_track, setTrack] = useState(track);
    const [cover_size, setCoverSize] = useState(300);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        // async function getAvailableDevices() {
        //     console.log(token);
        //     const response = await fetch("https://api.spotify.com/v1/me/player/devices", {
        //         method: 'GET',
        //         headers: {
        //             'Accept': 'application/json',
        //             'Content-Type': 'application/json',
        //             "Authorization": "Bearer " + token,
        //         }
        //     })
        //     const data = await response.json();
        //     console.log(data);
        // };

        // getAvailableDevices();

        window.onSpotifyWebPlaybackSDKReady = () => {
            // console.log(localStorage.getItem("anpanMusic"));

            var player = new window.Spotify.Player({
                name: 'ANPAN MUSIC ★',
                getOAuthToken: cb => { cb(token); },
                volume: 0.5
            });

            setPlayer(player);
            // localStorage.setItem("anpanMusic", JSON.stringify(player));
            console.log(player);

            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
            });

            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            player.addListener('player_state_changed', (state => {
                if (!state) {
                    return;
                }

                setTrack(state.track_window.current_track);
                setPaused(state.paused);
                // document.getElementById('background-image').style.backgroundImage = `url('${state.track_window.current_track.album.images[0].url}')`;

                player.getCurrentState().then(state => {
                    (!state) ? setActive(false) : setActive(true)
                });
            }));

            console.log('Connecting player...');
            player.connect();

            return () => {
                console.log('Disconnecting player...');
                player.disconnect();
            }
        };
    }, []);

    return (
        <>
            {/* <div id="background-image"></div> */}
            <div id="container">
                <div className="main-wrapper">
                    <img src={current_track.album.images[0].url} width={cover_size} height={cover_size} className="now-playing__cover" alt="" />

                    <div className="now-playing__side">
                        <div className="now-playing__name">
                            <strong>{current_track.name}</strong>
                        </div>

                        <div className="now-playing__artist">
                            {current_track.artists[0].name}
                        </div>
                    </div>
                    <div className="playback-buttons">
                        <button className="btn-spotify" onClick={() => { player.previousTrack() }} >
                            &lt;&lt;
                        </button>

                        <button className="btn-spotify" onClick={() => { player.togglePlay() }} >
                            {is_paused ? "PLAY" : "PAUSE"}
                        </button>

                        <button className="btn-spotify" onClick={() => { player.nextTrack() }} >
                            &gt;&gt;
                        </button>
                    </div>

                    {/* <button onClick={() => setCoverSize(cover_size + 10)}>+</button>
                    <button onClick={() => setCoverSize(cover_size - 10)}>-</button> */}
                </div>
                <div>
                    <Playlists token={token} />
                </div>
            </div>
        </>
    )
}

export default WebPlayback;