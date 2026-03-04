import PropTypes from 'prop-types';
import { getAllItems, getItemData, getItemsFiles } from '../../lib/items-util';
import { getPostCategories } from '../../lib/getPostCategories';
import { getPostTags } from '../../lib/getPostTags';
import BetaLayout from '@/components/beta/BetaLayout';
import GravityBookButton from '@/components/beta/GravityBookButton';
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens';
import PostContent from '../../components/posts/post-detail/post-content';
import PostPageNavigation from '../../components/posts/post-page-navigation';

const FONT_KEY = 'bold';
const fonts = fontPairings[FONT_KEY];
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

function PostDetailPage(props) {
    const { post, tags, categories, prevPost, nextPost } = props;
    return (
        <BetaLayout
            title={post.title}
            description={post.excerpt}
            canonical={`https://reluxemedspa.com/posts/${post.slug}`}
        >
            <PostContent post={post} categories={categories} tags={tags} />
            <PostPageNavigation prevPost={prevPost} nextPost={nextPost} />
        </BetaLayout>
    );
}

export function getStaticProps(context) {
    const { params } = context;
    const { slug } = params;

    const post = getItemData(slug, 'posts');
    const posts = getAllItems('posts');
    const categories = getPostCategories();
    const tags = getPostTags();
    const currentPostIndex = posts.findIndex((post) => post.slug === slug);
    const nextPost = posts[currentPostIndex + 1]
        ? posts[currentPostIndex + 1]
        : {};
    const prevPost = posts[currentPostIndex - 1]
        ? posts[currentPostIndex - 1]
        : {};

    return {
        props: {
            post,
            tags,
            categories,
            prevPost,
            nextPost,
        },
    };
}

export function getStaticPaths() {
    const postFilenames = getItemsFiles('posts');

    const slugs = postFilenames.map((fileName) =>
        fileName.replace(/\.md$/, '')
    );

    return {
        paths: slugs.map((slug) => ({ params: { slug } })),
        fallback: false,
    };
}

PostDetailPage.propTypes = {
    post: PropTypes.instanceOf(Object).isRequired,
    tags: PropTypes.instanceOf(Object).isRequired,
    categories: PropTypes.instanceOf(Object).isRequired,
    prevPost: PropTypes.instanceOf(Object).isRequired,
    nextPost: PropTypes.instanceOf(Object).isRequired,
};

PostDetailPage.getLayout = (page) => page;

export default PostDetailPage;
