import PropTypes from 'prop-types';
import BetaLayout from '@/components/beta/BetaLayout';
import GravityBookButton from '@/components/beta/GravityBookButton';
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens';
import Breadcrumb from '../../components/breadcrumb';
import AllItems from '../../components/posts/all-items';
import { getAllItems } from '../../lib/items-util';
import { getPostCategories } from '../../lib/getPostCategories';
import { getPostTags } from '../../lib/getPostTags';

const FONT_KEY = 'bold';
const fonts = fontPairings[FONT_KEY];
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

function allItemsPage({ posts, categories, tags }) {
    return (
        <BetaLayout
            title="All Posts"
            description="Read the latest blog posts from RELUXE Med Spa covering skincare, injectables, facials, and wellness."
            canonical="https://reluxemedspa.com/posts"
        >
            <Breadcrumb activePage="Posts" pageTitle="Our Posts" />
            <AllItems posts={posts} categories={categories} tags={tags} />
        </BetaLayout>
    );
}

export function getStaticProps() {
    const allItems = getAllItems('posts');
    const categories = getPostCategories();
    const tags = getPostTags();

    return {
        props: {
            posts: allItems,
            categories,
            tags,
        },
    };
}

allItemsPage.propTypes = {
    posts: PropTypes.instanceOf(Object).isRequired,
    categories: PropTypes.instanceOf(Object).isRequired,
    tags: PropTypes.instanceOf(Object).isRequired,
};

allItemsPage.getLayout = (page) => page;

export default allItemsPage;
