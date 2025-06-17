import dynamic from 'next/dynamic';
import { useMediaQuery } from 'react-responsive';
const MobileFooter = dynamic(() => import('./MobileFooter'));
const DesktopFooter = dynamic(() => import('./DesktopFooter'));
export default function Footer () {
    
 
    const isMobile = useMediaQuery({ query: '(min-width: 991px)' });
    return isMobile ? <DesktopFooter/>: <MobileFooter/> 
}
