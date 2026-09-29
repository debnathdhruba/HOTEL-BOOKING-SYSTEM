/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

/* eslint-disable react/jsx-one-expression-per-line */

import {
  CalendarOutlined, EditOutlined, EnvironmentOutlined, ExclamationCircleFilled,
  MailOutlined, PhoneOutlined, SafetyCertificateOutlined, UserOutlined
} from '@ant-design/icons';
import {
  Button, Image, Modal, Result, Skeleton, Tag, Tooltip, Upload
} from 'antd';
import ImgCrop from 'antd-img-crop';
import getConfig from 'next/config';
import React, { useState } from 'react';
import useFetchData from '../../hooks/useFetchData';
import ApiService from '../../utils/apiService';
import { getSessionToken, setSessionUserKeyAgainstValue } from '../../utils/authentication';
import notificationWithIcon from '../../utils/notification';
import { userStatusAsResponse } from '../../utils/responseAsStatus';
import ProfileEditModal from './ProfileEditModal';

const { publicRuntimeConfig } = getConfig();
const { confirm } = Modal;

function MyProfile() {
  const [editProfileModal, setEditProfileModal] = useState(false);
  const token = getSessionToken();

  // fetch user profile API data
  const [loading, error, response] = useFetchData('/api/v1/get-user');

  // handle to change user avatar upload
  const props = {
    accept: 'image/*',
    name: 'avatar',
    action: `${publicRuntimeConfig.API_BASE_URL}/api/v1/avatar-update`,
    method: 'put',
    headers: { authorization: `Bearer ${token}` },
    onChange(info) {
      if (info.file.status === 'done') {
        // Handle response from API
        if (info?.file?.response?.result_code === 0) {
          notificationWithIcon('success', 'SUCCESS', info?.file?.response?.result?.message || 'Your avatar change successful');
          // update local storage session user data
          setSessionUserKeyAgainstValue('avatar', info?.file?.response?.result?.data?.avatar);
          window.location.reload();
        } else {
          notificationWithIcon('error', 'ERROR', 'Sorry! Something went wrong. App server error');
        }
      } else {
        notificationWithIcon('error', 'ERROR', info?.file?.response?.result?.error || 'Sorry! Something went wrong. App server error');
      }
    }
  };

  // function handle verify user email mail send
  const handleVerifyEmail = () => {
    confirm({
      title: 'SEND EMAIL VERIFICATION LINK',
      icon: <ExclamationCircleFilled />,
      content: 'Are you sure send your email verification link?',
      onOk() {
        return new Promise((resolve, reject) => {
          ApiService.post('/api/v1/auth/send-email-verification-link')
            .then((res) => {
              if (res?.result_code === 0) {
                notificationWithIcon('success', 'SUCCESS', res?.result?.message || 'Verification link send successful');
                resolve();
              } else {
                notificationWithIcon('error', 'ERROR', 'Sorry! Something went wrong. App server error');
                reject();
              }
            })
            .catch((err) => {
              notificationWithIcon('error', 'ERROR', err?.response?.data?.result?.error?.message || err?.response?.data?.result?.error || 'Sorry! Something went wrong. App server error');
              reject();
            });
        }).catch(() => notificationWithIcon('error', 'ERROR', 'Oops errors!'));
      }
    });
  };

  return (
    <>
      <Skeleton loading={loading} paragraph={{ rows: 10 }} active avatar>
        {error ? (
          <Result
            title='Failed to fetch'
            subTitle={error}
            status='error'
          />
        ) : (
          <div className='account-dashboard'>
            <section className='account-hero'>
              <div className='avatar-editor'>
                {response?.data?.avatar ? (
                  <Image src={response.data.avatar} crossOrigin='anonymous' alt='Profile avatar' preview={false} />
                ) : <UserOutlined />}
                <ImgCrop showGrid rotationSlider>
                  <Upload {...props} showUploadList={false}>
                    <Tooltip title='Change profile picture'>
                      <Button className='avatar-edit-button' icon={<EditOutlined />} shape='circle' />
                    </Tooltip>
                  </Upload>
                </ImgCrop>
              </div>

              <div className='account-identity'>
                <span className='eyebrow'>Account overview</span>
                <h1>{response?.data?.fullName || 'Your profile'}</h1>
                <p>@{response?.data?.userName || 'member'}</p>
                <div className='account-badges'>
                  <Tag color={response?.data?.verified ? 'success' : 'warning'}>
                    <SafetyCertificateOutlined /> {response?.data?.verified ? 'Email verified' : 'Email not verified'}
                  </Tag>
                  <Tag color={response?.data?.role === 'admin' ? 'magenta' : 'blue'}>
                    {response?.data?.role || 'member'}
                  </Tag>
                </div>
              </div>

              <div className='account-actions'>
                {!response?.data?.verified && (
                  <Button onClick={handleVerifyEmail} size='large'>Verify email</Button>
                )}
                <Button onClick={() => setEditProfileModal(true)} type='primary' size='large' icon={<EditOutlined />}>Edit profile</Button>
              </div>
            </section>

            <div className='account-content-grid'>
              <section className='account-card account-details-card'>
                <div className='account-card-heading'>
                  <div><span className='eyebrow'>Personal details</span><h2>Your information</h2></div>
                  <UserOutlined />
                </div>
                <div className='detail-grid'>
                  <div className='detail-item'><MailOutlined /><div><span>Email address</span><strong>{response?.data?.email || 'Not provided'}</strong></div></div>
                  <div className='detail-item'><PhoneOutlined /><div><span>Phone number</span><strong>{response?.data?.phone || 'Not provided'}</strong></div></div>
                  <div className='detail-item'><CalendarOutlined /><div><span>Date of birth</span><strong>{response?.data?.dob?.split('T')[0] || 'Not provided'}</strong></div></div>
                  <div className='detail-item'><EnvironmentOutlined /><div><span>Address</span><strong>{response?.data?.address || 'Not provided'}</strong></div></div>
                </div>
              </section>

              <section className='account-card account-status-card'>
                <span className='eyebrow'>Account status</span>
                <h2>Good to go</h2>
                <div className='status-row'><span>Current session</span><Tag color={userStatusAsResponse(response?.data?.status).color}>{userStatusAsResponse(response?.data?.status).level}</Tag></div>
                <div className='status-row'><span>Joined</span><strong>{response?.data?.createdAt?.split('T')[0] || '—'}</strong></div>
                <div className='status-row'><span>Last updated</span><strong>{response?.data?.updatedAt?.split('T')[0] || '—'}</strong></div>
              </section>
            </div>
          </div>
        )}
      </Skeleton>

      {/* profile edit modal component */}
      {editProfileModal && (
        <ProfileEditModal
          editProfileModal={editProfileModal}
          setEditProfileModal={setEditProfileModal}
        />
      )}
    </>
  );
}

export default React.memo(MyProfile);
