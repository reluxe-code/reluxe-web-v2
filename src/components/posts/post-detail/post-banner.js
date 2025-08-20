import PropTypes from 'prop-types';
import Image from 'next/image';

function PostBanner({ title, image, date }) {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="post-banner relative">
            <div className="image relative w-full lg:h-[300px] h-[250px] before:absolute before:bg-black before:opacity-40 before:w-full before:h-full before:z-[1]">
                <Image
                    src={image}
                    alt={title}
                    layout="fill"
                    objectFit="cover"
                    priority
                />
            </div>
            <div className="container">
                <div className="content absolute top-1/2 transform -translate-y-1/2 z-[1]">
                    <div className="inner-content relative z-[1]">
                        <h2 className="lg:text-[80px] lm:text-[50px] text-[30px] lg:leading-[90px] text-white max-w-[770px]">
                            {title}
                        </h2>
                    </div>
                </div>
            </div>
        </div>
    );
}

PostBanner.propTypes = {
    title: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
};

export default PostBanner;
