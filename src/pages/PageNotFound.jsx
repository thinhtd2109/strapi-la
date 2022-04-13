import React from 'react';
import { Result, Button } from "antd";
import { Link } from 'react-router-dom';


const PageNotFound = () => (
    <Result
        status="404"
        title="404"
        subTitle="Xin lỗi, trang bạn tìm không tồn tại!"
        extra={<Link to='/'>Về trang chủ</Link>}
    />
)

export default PageNotFound;
