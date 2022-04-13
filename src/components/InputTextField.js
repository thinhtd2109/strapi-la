import _ from 'lodash';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Input, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import style from './style.module.scss';

const { TextArea } = Input;

const InputTextField = ({fieldname, object, setObject, row}) => {
    const [inputValue, setInputValue] = useState(_.get(object,fieldname));

    const onchangeAction = (e) => {
        setInputValue(_.get(e, 'target.value'));
    };

    const onBlurSetValue = () => {
        let temp = { ...object };
        const value = _.trim(inputValue);
        if (_.get(object,fieldname) === value) return;
        if (_.isEmpty(value) && inputValue === undefined) return;
        _.set(temp, fieldname, value);
        if (_.isFunction(setObject)) setObject(temp);
    };

    const onKeyPress = (e) => {
        if (e.key === 'Enter' || e.charCode === 13) {
            onBlurSetValue();
        }
        return;
    }

    useEffect(() => {
        setInputValue(_.get(object,fieldname));
    }, [object]);

    if (row > 1) {
        return (
            <TextArea
                rows={5}
                maxLength = {300}
                className={style.styleInputTextField}
                value={inputValue}
                id={`input-search-${fieldname}`}
                onBlur={onBlurSetValue}
                onChange={onchangeAction}
                onKeyPress={onKeyPress}
                autoComplete='off'
            />
        )
    }

    return (
        <Input
            className={style.styleInputTextField}
            value={inputValue}
            id={`input-search-${fieldname}`}
            onBlur={onBlurSetValue}
            onChange={onchangeAction}
            onKeyPress={onKeyPress}
            autoComplete='off'
        />
    )
}

InputTextField.propTypes = {
    fieldname: PropTypes.string,
    object: PropTypes.object,
    setObject: PropTypes.func
};

InputTextField.defaultProps = {
    object: {},
    row: 1
};

export default InputTextField;
