import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Tabs } from 'antd';
import Wrapper from '../../components/Wrapper/Wrapper';
import CategoryArticles from './Category';

const { TabPane } = Tabs;

const ArticlePage = () => {
    const location = useLocation();
    const [tabkey, setTabkey] = useState(location.state?.tabActive || "0");


    return (
        <Tabs activeKey={tabkey} defaultActiveKey={"0"} onChange={(key) => setTabkey(key)}>
            <TabPane
                tab={<span style={{ padding: 24 }}>Tin tức</span>}
                key="0"
            >
                <Wrapper>

                </Wrapper>
            </TabPane>
            <TabPane
                tab={<span style={{ padding: 24 }}>Danh mục</span>}
                key="1"

            >
                <Wrapper>
                    <CategoryArticles />
                </Wrapper>
            </TabPane>
        </Tabs>
    )
}

export default ArticlePage