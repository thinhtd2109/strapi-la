import _ from 'lodash';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';

import style from './style.module.scss';

const { Option } = Select;

const InputSelectField = ({fieldname, object, setObject, list, idOnly}) => {    
    const handleChange = (value) => {
        let temp = { ...object };        
        _.set(temp, fieldname, idOnly ? value : _.find(list,['id', value]));
        if (_.isFunction(setObject)) setObject(temp);
    };

    return (
        <Select 
            className = {style.styleInputSelectField}
            bordered = {false}
            defaultValue={1}
            // defaultValue={_.get(object, fieldname)} //??????????????????
            onChange={handleChange}
        >
            {
                _.map(list, (item, key) => 
                    <Option key={key} value={_.get(item,'id')}>{_.get(item,'name')}</Option>
                )
            }
        </Select>
    )
}

InputSelectField.propTypes = {
    fieldname: PropTypes.string,
    object: PropTypes.object,
    setObject: PropTypes.func,
    idOnly: PropTypes.bool
};

InputSelectField.defaultProps = {
    object: {},
    idOnly: false,
};

export default InputSelectField;
