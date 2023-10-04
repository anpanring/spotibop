import { useEffect, useState } from "react";
import './Playlists.css';

export default function Playlists({ token }) {
    const [playlists, setPlaylists] = useState([]);

    useEffect(() => {
        async function getPlaylists() {
            console.log(token);
            const response = await fetch("https://api.spotify.com/v1/me/playlists", {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer " + token,
                }
            })
            const data = await response.json();
            setPlaylists(data.items);
            console.log(data);
        };

        getPlaylists();
    }, []);

    return (
        <div className="container">
            <div className="playlists">
                {playlists.map((playlist) => {
                    return (
                        <a className="playlist" key={playlist.id} href="#">
                            <img
                                src={playlist.images[0].url}
                                alt={playlist.name}
                                height={80}
                                width={80}>
                            </img>
                        </a>
                    )
                })}
            </div>
        </div>
    )
}