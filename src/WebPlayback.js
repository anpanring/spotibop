import React, { useState, useEffect, useRef } from "react";
import Playlists from './Playlists';
import './WebPlayback.css';

const track = {
    name: "",
    id: "",
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

    const [loading, setLoading] = useState(false);
    const [player, setPlayer] = useState(null);
    const [isPaused, setPaused] = useState(false);
    const [isActive, setActive] = useState(false);
    const [time, setTime] = useState("0:00 / 0:00");
    const [current_track, setTrack] = useState(track);
    const [currentContext, setCurrentContext] = useState(null);
    const [devices, setDevices] = useState([]);
    const [canvasHeight, setCanvasHeight] = useState(100);
    const [count, setCount] = useState(0);

    const [albumArt, setAlbumArt] = useState([]);

    const canvasRef = useRef(null);

    // Update player state
    setInterval(() => {
        if (player) {
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

    // function recursion(count) {
    //     const lineLen = albumArt.length;
    //     console.log(count);
    //     if(count === lineLen) return;
    //     setAlbumArt(albumArt.substring(0, count) + '@' + albumArt.substring(count + 1));
    // }

    // setInterval(() => {
    //     if(albumArt.length > 0) {
    //         recursion(0);
    //     }
    // }, 250);

    // canvas manipulation
    useEffect(() => {
        // setInterval(() => {
        //     if(albumArt.length > 0){
        //         setAlbumArt(albumArt.substring(0, count) + '@' + albumArt.substring(count + 1));
        //         setCount(count + 1);
        //     }
        // }, 250);
        if (!current_track) return;
        const ctx = canvasRef.current.getContext('2d');
        const img = new Image();
        img.src = current_track.album.images[0].url;
        img.crossOrigin = "anonymous";
        img.onload = () => {
            // setAlbumArt("");
            let art = '';
            ctx.drawImage(img, 0, 0, canvasHeight, canvasHeight);
            const imgData = ctx.getImageData(0, 0, canvasHeight, canvasHeight);
            const data = imgData.data;
            let num = 0;
            for (let i = 0; i < data.length; i += 4) {
                // console.log(num);
                if (num % canvasHeight === 0 && num !== 0) {
                    art += '\n';
                }
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = avg; // red
                data[i + 1] = avg; // green
                data[i + 2] = avg; // blue

                if (avg < 42.5) art += '@';
                else if (avg < 85) art += 'X';
                else if (avg < 127.5) art += 'Z';
                else if (avg < 170) art += '7';
                else if (avg < 212.5) art += '+';
                else art += '`';
                num++;
            }
            setAlbumArt(art);
            // ctx.putImageData(imgData, 0, 0);
        }
    }, [current_track, canvasHeight]);

    // Set up player, add event listeners
    useEffect(() => {

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            // console.log(localStorage.getItem("anpanMusic"));

            if (player == null) {
                setLoading(true);

                // create player
                const player = new window.Spotify.Player({
                    name: 'ANPAN MUSIC ★',
                    getOAuthToken: cb => { cb(token); },
                    volume: 0.5
                });

                setPlayer(player);

                player.addListener('ready', ({ device_id }) => {
                    console.log('Ready with Device ID', device_id);
                    connectDevice(device_id);
                    setLoading(false);
                });

                player.addListener('not_ready', ({ device_id }) => {
                    console.log('Device ID has gone offline', device_id);
                });

                player.addListener('player_state_changed', (state => {
                    console.log('player state changed', state);
                    if (!state) {
                        return;
                    }

                    setTrack(state.track_window.current_track);
                    setPaused(state.paused);
                    // setCurrentContext(state.context.metadata.context_description);
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
                    setPlayer(null);
                }
            }
        };
    }, []);

    // get devices
    useEffect(() => {

        // console.log(img.src);
        // ctx.drawImage(img, 0, 0);

        // const imgData = ctx.getImageData(0, 0, 300, 300);
        // console.log(imgData);
        // for(let i = 0; i < imgData.data.length; i += 4) {
        //     console.log(imgData.data[i]);
        // }
        // ctx.putImageData(imgData, 0, 0);

        async function getAvailableDevices() {
            const response = await fetch("https://api.spotify.com/v1/me/player/devices", {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer " + token,
                }
            })
            const data = await response.json();
            setDevices(data.devices);
        };

        getAvailableDevices();


    }, []);

    function connectDevice(device_id) {
        fetch('https://api.spotify.com/v1/me/player', {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify({
                device_ids: [device_id],
                play: true
            })
        })
    }

    return (
        <>
            {/* <div id="background-image"></div> */}
            <div id="container">
                <nav className="navbar">
                    <h3>ANPAN MUSIC ★</h3>
                    <h3>anpankid</h3>
                </nav>
                <div className="main-wrapper">
                    {loading && <div>Loading...</div>}
                    <canvas id="art" width={canvasHeight} height={canvasHeight} ref={canvasRef}></canvas>
                    {/* <img src={current_track.album.images[0].url} width={300} height={300} className="now-playing__cover" alt="" /> */}

                    {current_track ?
                        <>
                            <pre className="ascii">{albumArt}</pre>
                            <input type="range" value={canvasHeight} min="1" max={window.innerWidth / 10} onChange={(e) => setCanvasHeight(e.target.value)} id="myRange"></input>

                            <div className="now-playing__side">
                                <div className="now-playing__name">
                                    <strong>{current_track.name}</strong>
                                </div>

                                <div className="now-playing__artist">
                                    {current_track.artists.map(artist => artist.name).join(", ")}
                                </div>

                                <div>{time}</div>
                            </div>
                        </> : <div>No current track</div>}
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

                    {/* <div>Devices: {devices.map(device => <p onClick={() => connectDevice(device.id)}>{device.name}</p>)}</div> */}
                    {/* <div>Devices: {devices.map(device => device.name).join(", ")}</div> */}

                    {/* {currentContext && <p>Playing from <a href={currentContext.external_urls.spotify}>{currentContext.name}</a> by {currentContext.owner.display_name}</p>} */}
                    {currentContext && <p>Playing from: {currentContext}</p>}
                </div>
                <div>
                    <Playlists token={token} setCurrentContext={setCurrentContext} />
                </div>
            </div>
        </>
    )
}

export default WebPlayback;