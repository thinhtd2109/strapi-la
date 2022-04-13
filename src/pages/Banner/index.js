import { useLazyQuery, useQuery } from "@apollo/client";
import { Button, Col, Row, Spin, Tabs, Typography } from "antd";
import _, { get } from "lodash";
import { Fragment, useEffect, useMemo, useState } from "react";
import { UploadImage } from "../../components/Upload";
import Wrapper from "../../components/Wrapper/Wrapper";
import { GET_BANNERS_BY_TYPE, GET_BANNER_PROMOTION, GET_BANNER_TYPES, GET_LIST_BANNER } from "../../graphql/schemas/banner/query";
import { PlusOutlined, FormOutlined, DeleteOutlined } from "@ant-design/icons";
import "./styles.scss";
import { user } from "../../constant/user";

export const BannerPage = () => {
    const { Title } = Typography;
    const userId = user.getValue('id');
    const { TabPane } = Tabs;
    const [bannerLst, setBannerLst] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const { data: dataBannerType, loading: loadingBannerType } = useQuery(GET_BANNER_TYPES);
    const [getBanners, { data: banners, loading: loadingBanner, error: errorBanner }] = useLazyQuery(GET_BANNERS_BY_TYPE, { fetchPolicy: 'network-only' });
    const [getBannerPromotion, { data: bannersPromotion, loading: loadingBannerPromotion, error: errorPromotion }] = useLazyQuery(GET_BANNER_PROMOTION, { fetchPolicy: 'network-only' });
    // const { loading, data } = useQuery(GET_LIST_BANNER, { fetchPolicy: "cache-and-network" });
    const handleCreateBanner = () => {
        let newList = [...bannerLst];
        let newPromotionList = [...promotions];
        newPromotionList.push({});
        newList.push({});
        setPromotions(newPromotionList);
        setBannerLst(newList);
    }

    useEffect(() => {
        async function getBannersInit() {
            setLoading(true);
            await getBanners({
                variables: {
                    type: 'BANNER'
                }
            });

            setLoading(false)
        }

        getBannersInit();

    }, []);

    useEffect(() => {
        // if (banners) {
        setBannerLst(banners?.media ?? []);
        // }
    }, [banners]);

    useEffect(() => {
        // if (bannersPromotion) {
        setPromotions(bannersPromotion?.media ?? []);

        // }

    }, [bannersPromotion])


    const getBannerByType = async (type) => {
        setLoading(true);
        if (type === 'BANNER_PROMOTION') {
            await getBannerPromotion();
            setLoading(false);
        } else {
            await getBanners({
                variables: {
                    type: type
                }
            });
            setLoading(false);
        }
    }



    if (loadingBannerType) return <div className="wapperLoading"><Spin tip="Đang tải dữ liệu..." /></div>
    return <div className="bannerWrapper">
        <Row justify="space-between" >
            <Typography.Title level={3}>Danh sách banner</Typography.Title>
            <Button
                className="stylePrimary"
                icon={<PlusOutlined />}
                onClick={handleCreateBanner}
            >
                Thêm
            </Button>
        </Row>

        <Tabs defaultActiveKey="0" tabPosition='top' onChange={getBannerByType}>
            {_.map(dataBannerType?.media_type, (bannerType, index) => (
                <TabPane tab={bannerType.name} key={bannerType?.code}>
                    <Wrapper>
                        {
                            bannerType.code === "BANNER_PROMOTION" ? <Fragment>
                                {
                                    (loading || !bannersPromotion) ? <div className="wapperLoading"><Spin tip="Đang tải dữ liệu..." /></div> : (
                                        <>
                                            {promotions && _.size(promotions) === 0 ? <Wrapper><div style={{ textAlign: 'center' }}>Chưa có banner</div></Wrapper> : <Fragment>
                                                <Row gutter={[16, 16]}>
                                                    {
                                                        _.map(promotions, (item, index) => {
                                                            return <Col span={6} key={index}>
                                                                <UploadImage id={userId} data={[item]} type={bannerType.code} />
                                                            </Col>
                                                        })
                                                    }


                                                </Row>
                                            </Fragment>
                                            }
                                        </>
                                    )
                                }

                            </Fragment> : <Fragment>
                                {
                                    (loading || !banners) ? <div className="wapperLoading"><Spin tip="Đang tải dữ liệu..." /></div> : (
                                        <>
                                            {bannerLst && _.size(bannerLst) === 0 ? <Wrapper><div style={{ textAlign: 'center' }}>Chưa có banner</div></Wrapper> : <Fragment>
                                                <Row gutter={[16, 16]}>
                                                    {
                                                        _.map(bannerLst, (item, index) => {
                                                            return <Col span={6} key={index}>
                                                                <UploadImage id={userId} data={[item]} type={bannerType.code} />
                                                            </Col>
                                                        })
                                                    }
                                                </Row>
                                            </Fragment>
                                            }
                                        </>
                                    )
                                }
                            </Fragment>
                        }

                    </Wrapper>
                </TabPane>
            ))}
        </Tabs>
    </div >
}