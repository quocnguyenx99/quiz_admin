import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'

import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'

import { CBadge, CNavLink, CSidebarNav } from '@coreui/react'
import { axiosClient } from '../axiosConfig'

export const AppSidebarNav = ({ items }) => {
  const [dataNotSeen, setDataNotSeen] = useState({})
  useEffect(() => {
    const fetchNotSeenData = async () => {
      try {
        const response = await axiosClient.get('/admin/count-member-gift')

        if (response.data.status === true) {
          setDataNotSeen(response.data)
        }
      } catch (error) {
        console.error('Fetch data not seen is error', error)
      }
    }

    fetchNotSeenData()
  }, [])

  const navLink = (name, icon, badge, indent = false) => {
    return (
      <>
        {icon
          ? icon
          : indent && (
              <span className="nav-icon">
                <span className="nav-icon-bullet"></span>
              </span>
            )}
        <div style={{ fontSize: '13.6px' }}>{name && name}</div>
        {badge && (
          <CBadge color={badge.color} className="ms-auto">
            {badge.text}
          </CBadge>
        )}
        {name == 'Danh sách thành viên' && (
          <CBadge color={'danger'} className="ms-auto" size="sm">
            {dataNotSeen?.countMember}
          </CBadge>
        )}
        {name == 'Danh sách đổi quà' && (
          <CBadge color={'danger'} className="ms-auto" size="sm">
            {dataNotSeen?.countGiftHistory}
          </CBadge>
        )}
      </>
    )
  }

  const navItem = (item, index, indent = false) => {
    const { component, name, badge, icon, ...rest } = item
    const Component = component
    return (
      <Component as="div" key={index}>
        {rest.to || rest.href ? (
          <CNavLink {...(rest.to && { as: NavLink })} {...rest}>
            {navLink(name, icon, badge, indent)}
          </CNavLink>
        ) : (
          navLink(name, icon, badge, indent)
        )}
      </Component>
    )
  }

  const navGroup = (item, index) => {
    const { component, name, icon, items, to, ...rest } = item
    const Component = component
    return (
      <Component compact as="div" key={index} toggler={navLink(name, icon)} {...rest}>
        {item.items?.map((item, index) =>
          item.items ? navGroup(item, index) : navItem(item, index, true),
        )}
      </Component>
    )
  }

  return (
    <CSidebarNav as={SimpleBar}>
      {items &&
        items.map((item, index) => (item.items ? navGroup(item, index) : navItem(item, index)))}
    </CSidebarNav>
  )
}

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
}
