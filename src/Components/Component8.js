import dynamic from 'next/dynamic';
import { useMediaQuery } from 'react-responsive';
const Component8mv = dynamic(() => import('./Component8mv'));
const Component8dv = dynamic(() => import('./Component8dv'));
export default function Component8 () {
    
 
    const isMobile = useMediaQuery({ query: '(min-width: 991px)' });
    return isMobile ? <Component8dv/>: <Component8mv/> 
}
