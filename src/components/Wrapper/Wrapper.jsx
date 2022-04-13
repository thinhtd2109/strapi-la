import React from 'react';
import "./styles.scss";
import clsx from 'clsx';

Wrapper.propTypes = {

};

function Wrapper({ children, className }) {
    return (
        <div className={clsx("wrapper", className)}>
            {children}
        </div>
    );
}

export default Wrapper;