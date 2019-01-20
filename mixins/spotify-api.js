const SpotifyWebApi = require('spotify-web-api-js');

const spotifyApi = new SpotifyWebApi();

export default {
    methods: {
        async setSpotifyAccessToken() {
            const callbackUrl = window.location.href;
            const clientId = '9ce0744ff4a04334966cbcf3fb7e312d';
            const apiUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${callbackUrl}`;
            let hash;
            if (!window.location.hash) {
                window.location.replace(apiUrl);
            } else {
                const url = window.location.href;
                [, hash] = url.split('#');
                [hash] = hash.split('&');
                [, hash] = hash.split('=');
            }
            const accessToken = hash;
            if (accessToken) {
                await spotifyApi.setAccessToken(accessToken);
            }
        },
        async getArtists(timeRange) {
            const artists = await spotifyApi.getMyTopArtists({
                limit: 5,
                time_range: timeRange,
            });
            this.artists = Object.freeze(artists);
            this.setArtistImage();
        },
        setArtistImage() {
            const { items } = this.artists;
            if (items && items.length > 0) {
                const firstItem = items[0];
                const { images } = firstItem;
                if (images && images.length > 1) {
                    // second image 320x320
                    const firstImageUrl = images[1].url;
                    this.topArtistImage = firstImageUrl;
                }
            }
        },
        async getTracks(timeRange) {
            const tracks = await spotifyApi.getMyTopTracks({
                limit: 5,
                time_range: timeRange,
            });
            this.tracks = Object.freeze(tracks);
        },
        getTopGenre() {
            if (this.artists.items.length > 0) {
                const genreList = this.artists.items.reduce(
                    (acc, item) => acc.concat(item.genres), [],
                );
                const genreWordsList = genreList.reduce(
                    (acc, item) => acc.concat(item.split(/\s+/)), [],
                );
                const topGenre = this.mostFrequent(genreWordsList);
                if (topGenre) {
                    this.topGenre = this.getCapitalizeWord(topGenre);
                }
            }
        },
        mostFrequent(arr) {
            const pairsObj = arr.reduce((obj, value) => {
                const objCloned = Object.assign({}, obj);
                if (!obj[value]) {
                    objCloned[value] = 1;
                } else {
                    objCloned[value] += objCloned[value];
                }
                return objCloned;
            }, {});
            const values = Object.values(pairsObj);

            const i = values.findIndex(el => el === Math.max(...values));
            const mostFrequent = Object.entries(pairsObj)[i];
            return mostFrequent.length > 1 ? mostFrequent[0] : '';
        },
        getCapitalizeWord(word) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        },
    },
};
