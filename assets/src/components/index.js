import { __ } from "@wordpress/i18n";
import { IllustrationIdle, Illustration404, Logo } from '../lib/Illustrations';
import BackgroundControl from './BackgroundControl/BackgroundControl';
import BoxShadowControl from './BoxShadowControl/BoxShadowControl';
import BreadcrumbControl from './BreadcrumbControl/BreadcrumbControl';
import ColorPickerControl from './ColorPickerControl/ColorPickerControl';
import FontControl from './FontControl/FontControl';
import HorizontalMenuControl from './HorizontalMenuControl/HorizontalMenuControl';
import IllustrationControl from './IllustrationControl/IllustrationControl';
import MediaUploaderControl from './MediaUploaderControl/MediaUploaderControl';
import MultiColorControl from './MultiColorControl/MultiColorControl';
import PageInfo from './PageInfo/PageInfo';
import PluginCard from './PluginCard/PluginCard';
import UnitControl from './UnitControl/UnitControl';
import VerticalMenuControl from './VerticalMenuControl/VerticalMenuControl';
import TextShadowControl from './TextShadowControl/TextShadowControl';
import { Skeleton, } from '@douyinfe/semi-ui';
const NotFound = () => (
    <div style={{ textAlign: 'center', padding: '40px' }}>
        <Illustration404 style={{ width: 250, height: 250, display: 'inline-block' }} />
        <h3>{__("404 - Page Not Found", "authguard")}</h3>
    </div>
);
const SkeletonPlaceholder = () => (
    <>
        <Skeleton.Title style={{ width: '60%', marginBottom: 5 }} />
        <Skeleton.Paragraph rows={1} style={{ width: '70%' }}/>
    </>
);

export {
    BackgroundControl,
    BoxShadowControl,
    BreadcrumbControl,
    ColorPickerControl,
    FontControl,
    HorizontalMenuControl,
    IllustrationControl,
    MediaUploaderControl,
    MultiColorControl,
    NotFound,
    PageInfo,
    PluginCard,
    SkeletonPlaceholder,
    TextShadowControl,
    UnitControl,
    VerticalMenuControl,
};