import React, { useState, useEffect } from "react";
import { Col, Row, Select, Tag, Typography } from "antd";
import style from "./styles.module.scss";
import _ from "lodash";
import { useGetWards } from "../../../../graphql/schemas/masterdata/address/query";

const { Option } = Select;

const BoxDistrict = ({ data, removeBox, closeable }) => {
 
  const [wards, setWards] = useState([]);
  const wardList = useGetWards({ districtId: _.get(data, "district.id") });
  const onClose = (data, index) => {
    let temp = _.cloneDeep(wards);
    let filtered = _.filter(temp, (item, key) => key !== index);
    setWards(filtered);
  };

  useEffect(() => {
    setWards(_.get(wardList, 'results'));
  }, [wardList])

  return (
    <Col className="gutter-row" span={12}>
      <div className={style.boxDistrictContainer}>
        <Row justify="center" align="space-between" className={style.header}>
          <Typography>{data.province.name + " - " + data.district.name}</Typography>
          {/* <RemoveIcon
            onClick={() => removeBox(data)}
            className={style.removeIcon}
          /> */}
        <Select
            mode="multiple"
            value={wards}
            placeholder="Phường"
            style={{ display: "block", width: '100px' }}
            onChange={(value) => {
              setWards(value);
            }}
            showArrow
            disabled
          >
            {_.map(wardList, (item) => {
              return (
                <Option key={item.id} value={JSON.stringify(item)}>
                  {item.name}
                </Option>
              );
            })}
          </Select>
        </Row>
        <Row gutter={[12, 12]} className={style.body}>
         
          <Row style={{ padding: 12 }} gutter={[12, 12]}>
            {_.map(wardList, (item, index) => {
              return (
                <Tag
                  closable={closeable}
                  //onClose={() => onClose(item, index)}
                  className={style.tags}
                >
                  <Typography style={{ marginRight: 6 }}>
                    {item.name}
                  </Typography>
                </Tag>
              );
            })}
          </Row>
        </Row>
      </div>
    </Col>
  );
};
export default BoxDistrict;
