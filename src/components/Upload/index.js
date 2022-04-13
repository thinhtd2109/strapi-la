import { Image, message, notification, Upload } from "antd"
import axios from "axios";
import * as _ from 'lodash'
import { Fragment, useEffect, useState } from "react"
import { ReactComponent as UploadProduct } from '../../assets/icons/product/upload-product.svg';
import { LoadingOutlined, CloseCircleFilled } from '@ant-design/icons';
import "./styles.scss"
import DeleteModal from "../Modal/DeleteModal";
import { useMutation } from "@apollo/client";
import { DELETE_BANNER } from "../../graphql/schemas/banner/mutation";
import { GET_LIST_BANNER } from "../../graphql/schemas/banner/query";

import { user } from '../../constant/user';
export const UploadImage = ({ data, type }) => {
    const userId = user.getValue('id');
    const [image, setImage] = useState(data ?? []);
    const [loading, setLoading] = useState(false);
    const [isConfirm, setIsConfirm] = useState(false);
    const [deleteBanner] = useMutation(DELETE_BANNER, {
        onCompleted: () => {
            setIsConfirm(false);
            setImage([]);
            return notification['success']({
                message: 'Thành công',
                description: 'Xóa banner thành công'
            });
        },
        onError: (err) => {
            notification['error']({
                message: 'Thất bại',
                description: _.get(err, 'message', "Xóa banner thất bại"),
            });
        },
        refetchQueries: [
            {
                query: GET_LIST_BANNER,
                variables: {}
            }
        ]
    });

    const upload = async (file) => {

        const formData = new FormData();

        formData.append("file", file);

        formData.append('media_type_code', type);
        formData.append('created_by', userId);

        setLoading(true)

        try {
            const config = {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
            const { data } = await axios.post(process.env.REACT_APP_BASEURL_UPLOAD, formData, config);
            setImage(data);
            setLoading(false)
        } catch (error) {
        }

    }

    function beforeUpload(file) {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg' || file.type === "image/svg+xml";
        setImage([])
        if (isJpgOrPng === false) {
            message.error('Vui lòng chọn hình ảnh');
        }
        // const isLt2M = file.size / 1024 / 1024 < 2;
        // if (!isLt2M) {
        //   message.error('Image must smaller than 2MB!');
        // }
        return isJpgOrPng;
    }

    const handleDeleteBanner = () => {
        let bannerId = _.get(image[0], 'id', null);
        deleteBanner({
            variables: {
                id: bannerId,
                account: user.getValue('id')
            }
        })
    };

    useEffect(() => {
        setImage(data);
        return () => setImage([]);
    }, [data])
    return <Fragment>

        <DeleteModal
            visible={isConfirm}
            onDelete={handleDeleteBanner}
            onCancel={() => setIsConfirm(!isConfirm)}
            title="Xóa banner"
            content1="Bạn muốn xóa banner"
            content2="Vui lòng xác nhận bên dưới"
        />
        <div className="uploadImageContainer" style={{ display: 'flex' }}>
            <Upload
                name="photo"
                listType={!_.isEmpty(image[0]) ? undefined : "picture-card"}
                className="avatar-uploader"
                action={upload}

                beforeUpload={beforeUpload}
                showUploadList={false}
                style={{ width: "100%" }}
            >
                <div>
                    {!_.isEmpty(image[0]) ?
                        <Image
                            style={{ width: '100%', cursor: 'pointer', height: '137px' }}
                            src={`${process.env.REACT_APP_S3_GATEWAY}${image[0].url}`}
                            alt="Image Product"
                            preview={false} />

                        :
                        loading ? <LoadingOutlined /> :
                            <div className="flex flex-column"
                                style={{ color: '#FCB040' }}>
                                <UploadProduct
                                    fill="#FCB040"
                                    width="40px"
                                    height="40px" />
                                Upload
                            </div>
                    }

                </div>
            </Upload>
            {!_.isEmpty(image[0]) && <CloseCircleFilled className="closeIcon" onClick={() => setIsConfirm(true)} />}

        </div>

    </Fragment>
}