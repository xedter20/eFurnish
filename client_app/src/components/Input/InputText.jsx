import React from 'react';
import ReactDOM from 'react-dom';
import { Formik, Form, useField } from 'formik';
import * as Yup from 'yup';
import Icon from '../Icon/index.tsx';

const MyTextInput = ({
  label,
  icons,
  hasTextareaHeight,
  labelColor,
  labelFor,
  isDisabled,
  ...props
}) => {
  // useField() returns [formik.getFieldProps(), formik.getFieldMeta()]
  // which we can spread on <input>. We can use field meta to show an error
  // message if the field is invalid and it has been touched (i.e. visited)
  const [field, meta] = useField(props);

  // console.log({ DeX: props.isDisabled })

  let controlClassName = [
    'px-3 py-2 max-w-full border-gray-700 rounded w-full dark:placeholder-gray-400',
    meta.touched && meta.error
      ? 'px-3 py-2 max-w-full border-2 border-red-600 rounded w-full dark:placeholder-red-600'
      : '',
    'focus:ring focus:ring-blue-600 focus:border-blue-600 focus:outline-none',
    props.hasTextareaHeight ? 'h-24' : 'h-10',
    props.isBorderless ? 'border-0' : 'border',
    props.isTransparent ? 'bg-transparent' : 'bg-white dark:bg-slate-800',
    isDisabled ? 'border-gray-100' : '',
    'rounded-lg',
    ''
  ].join(' ');

  return (
    <>
      <div className="mb-6 last:mb-0">
        {/* {label && <label className={`mt-0 font-bold text-neutral-600  block mb-0 ${labelColor}`}>
          {label}</label>
        } */}
        {label && (
          <label
            className={`block mb-2 text-neutral-900 text-left ${labelFor ? 'cursor-pointer' : ''
              }`}>
            {label}
          </label>
        )}

        <div className="relative">
          <input
            className={`${controlClassName} ${icons ? 'pl-10' : ''}`}
            {...field}
            {...props}
          />

          {icons && (
            <Icon
              path={icons}
              w="w-10"
              h={hasTextareaHeight ? 'h-full' : 'h-12'}
              className="z-0 absolute top-0 left-0 z-0 pointer-events-none text-gray-500 dark:text-slate-400"
            />
          )}
        </div>
        {meta.touched && meta.error ? (
          <div className="text-xs text-left text-red-500 dark:text-red-400 mt-1">
            {meta.error}
          </div>
        ) : null}
      </div>
    </>
  );
};

export default MyTextInput;
