import React, { useState, useEffect, useRef } from "react";
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

    const [player, setPlayer] = useState(null);
    const [isPaused, setPaused] = useState(false);
    const [isActive, setActive] = useState(false);
    const [time, setTime] = useState(-1);
    const [current_track, setTrack] = useState(track);
    const [devices, setDevices] = useState([]);

    const canvasRef = useRef(null);

    setInterval(() => {
        if(player) {
            player.getCurrentState().then(state => {
                if (!state) {
                    return;
                }
                let posMins = Math.floor(state.position / 1000 / 60);
                let posSecs = Math.floor(state.position / 1000 % 60);
                posSecs = posSecs < 10 ? "0" + posSecs : posSecs;

                let durMins = Math.floor(state.duration / 1000 / 60);
                let durSecs = Math.floor(state.duration / 1000 % 60);
                durSecs = durSecs < 10 ? "0" + durSecs : durSecs;

                setTime(
                    posMins + ":" + posSecs + " / " + durMins + ":" + durSecs);
            });
        
        }
    }, 500);

    useEffect(() => {
        window.onSpotifyWebPlaybackSDKReady = () => {
            // console.log(localStorage.getItem("anpanMusic"));

            if (player == null) {
                var newPlayer = new window.Spotify.Player({
                    name: 'ANPAN MUSIC ★',
                    getOAuthToken: cb => { cb(token); },
                    volume: 0.5
                });

                newPlayer.addListener('ready', ({ device_id }) => {
                    console.log('Ready with Device ID', device_id);
                });
    
                newPlayer.addListener('not_ready', ({ device_id }) => {
                    console.log('Device ID has gone offline', device_id);
                });
    
                newPlayer.addListener('player_state_changed', (state => {
                    if (!state) {
                        return;
                    }
    
                    setTrack(state.track_window.current_track);
                    setPaused(state.paused);
                    // document.getElementById('background-image').style.backgroundImage = `url('${state.track_window.current_track.album.images[0].url}')`;
    
                    newPlayer.getCurrentState().then(state => {
                        (!state) ? setActive(false) : setActive(true)
                    });
                }));

                setPlayer(newPlayer);
                console.log('new player created');
    
                console.log('Connecting player...');
                newPlayer.connect();
    
                return () => {
                    console.log('Disconnecting player...');
                    newPlayer.disconnect();
                }
            }
        };
    });

    useEffect(() => {
        console.log(current_track);

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        const ctx = canvasRef.current.getContext('2d');
        const img = new Image();
        img.src = current_track.album.images[0].url;
        img.crossOrigin = "anonymous";
        console.log(img.src);
        ctx.drawImage(img, 0, 0);

        // const imgData = ctx.getImageData(0, 0, 300, 300);
        // console.log(imgData);
        // for(let i = 0; i < imgData.data.length; i += 4) {
        //     console.log(imgData.data[i]);
        // }
        // ctx.putImageData(imgData, 0, 0);

        async function getAvailableDevices() {
            console.log(token);
            const response = await fetch("https://api.spotify.com/v1/me/player/devices", {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer " + token,
                }
            })
            const data = await response.json();
            console.log(data);
            setDevices(data.devices);
        };

        getAvailableDevices();


    }, [current_track]);

    return (
        <>
            {/* <div id="background-image"></div> */}
            <div id="container">
                <div className="main-wrapper">
                    <canvas id="art" width={300} height={300} ref={canvasRef}></canvas>
                    {/* <img src={current_track.album.images[0].url} width={coverSize} height={coverSize} className="now-playing__cover" alt="" /> */}

                    <div className="now-playing__side">
                        <div className="now-playing__name">
                            <strong>{current_track.name}</strong>
                        </div>

                        <div className="now-playing__artist">
                            {current_track.artists.map(artist => artist.name).join(", ")}
                        </div>

                        <div>{time}</div>
                    </div>
                    <div className="playback-buttons">
                        <button className="btn-spotify" onClick={() => { player.previousTrack() }} >
                            &lt;&lt;
                        </button>

                        <button className="btn-spotify" onClick={() => { player.togglePlay() }} >
                            {isPaused ? "PLAY" : "PAUSE"}
                        </button>

                        <button className="btn-spotify" onClick={() => { player.nextTrack() }} >
                            &gt;&gt;
                        </button>
                    </div>

                    <div>{devices.map(device => device.name).join(", ")}</div>

                    {/* <button onClick={() => setCoverSize(coverSize + 10)}>+</button>
                    <button onClick={() => setCoverSize(coverSize - 10)}>-</button> */}
                </div>
                <div>
                    <Playlists token={token} />
                </div>
            </div>
        </>
    )
}

export default WebPlayback;