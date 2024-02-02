
const PlaylistPage = async ({
    params
} : {
    params: { playlistId: string }
}) => {
    return (
        <div>
            {params.playlistId}
        </div>

    );
};

export default PlaylistPage;