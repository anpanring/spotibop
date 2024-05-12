import { useEffect, useState, useRef } from "react";
import './Playlists.css';

export default function Playlists({ token, setCurrentContext }) {
    const [playlists, setPlaylists] = useState([]);
    const [currentPlaylist, setCurrentPlaylist] = useState(null);
    const [currentItems, setCurrentItems] = useState(null);

    useEffect(() => {
        async function getPlaylists() {
            const response = await fetch("https://api.spotify.com/v1/me/playlists", {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer " + token,
                }
            })
            const data = await response.json();
            setPlaylists(data.items.slice(0, 5));
        };

        getPlaylists();
    }, []);

    async function getCurrent(playlist) {
        setCurrentPlaylist(playlist);
        const response = await fetch(playlist.tracks.href, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + token,
            }
        })
        const data = await response.json();
        setCurrentItems(data.items);
    }

    function playSong(id, index) {
        setCurrentContext(currentPlaylist.name);
        fetch('https://api.spotify.com/v1/me/player/play', {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + token,
            },
            body: JSON.stringify({
                context_uri: `spotify:playlist:${id}`,
                offset: {
                    position: index
                },
            })
        })
    }

    // console.log(currentItems);

    return (
        <div className="container">
            {!currentItems && <div className="playlists">
                {playlists.map((playlist) =>
                    <PlaylistItem playlist={playlist} getCurrent={getCurrent} />
                )}
            </div>}
            {currentItems && <div className="current">
                <button onClick={() => setCurrentItems(null)}>Back</button>
                {currentItems.map((track, index) =>
                    <>
                        <p
                            className="track"
                            key={track.track.id}
                            onClick={() => playSong(currentPlaylist.id, index)}
                        >
                            {track.track.name} - {track.track.artists[0].name}
                        </p>
                        {/* <img src={track.track.album.images[1].url} alt={track.track.name} loading="lazy" /> */}
                    </>
                )}
            </div>}
        </div>
    )
}

// onClick={playSong(current.id, index)}>{track.track.name}

function PlaylistItem({ playlist, getCurrent }) {
    const [art, setArt] = useState('');
    const canvasRef = useRef(null);

    // useEffect(() => {
    //     const ctx = canvasRef.current.getContext('2d');
    //     const img = new Image();
    //     img.src = playlist.images[0].url;
    //     img.crossOrigin = "anonymous";
    //     img.onload = () => {
    //         // setAlbumArt("");
    //         let art = '';
    //         ctx.drawImage(img, 0, 0, 50, 50);
    //         const imgData = ctx.getImageData(0, 0, 50, 50);
    //         const data = imgData.data;
    //         let num = 0;
    //         for (let i = 0; i < data.length; i += 4) {
    //             // console.log(num);
    //             if (num % 50 === 0 && num !== 0) {
    //                 art += '\n';
    //             }
    //             const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    //             data[i] = avg; // red
    //             data[i + 1] = avg; // green
    //             data[i + 2] = avg; // blue

    //             if (avg < 42.5) art += '@';
    //             else if (avg < 85) art += 'X';
    //             else if (avg < 127.5) art += 'Z';
    //             else if (avg < 170) art += '7';
    //             else if (avg < 212.5) art += '+';
    //             else art += '`';
    //             num++;
    //         }
    //         console.log(art);
    //         setArt(art);
    //     }
    // }, []);

    return <div className="playlist" key={playlist.id} onClick={() => getCurrent(playlist)}>
        <canvas id="playlistArt" ref={canvasRef}></canvas>
        <img
            src={playlist.images[0].url}
            alt={playlist.name}
            height={150}
            width={150}>
        </img>
        <pre>{art}</pre>
    </div>
}