import React from 'react';
import { renderRoutes } from "react-router-config";
import { NavLink } from 'react-router-dom';
import Scroll from '../../scroll';
import { 
    Top,
    Tab,
    TabItem,
} from './style'
function Home (props) {
    const { route } = props;
    return (
        <div>
            <Top>
                <span className="iconfont menu"></span>
                <span className="title">WebApp</span>
                <span className="iconfont search"></span>
            </Top>
            <Tab>
                <NavLink to="/tube" activeClassName="selected"><TabItem><span>直播</span></TabItem></NavLink>
            </Tab>
            <div>
                <Scroll>
                    <div>
                        { renderRoutes (route.routes) }
                    </div>
                </Scroll>
            </div>
        </div>
    )
}
export default React.memo (Home);