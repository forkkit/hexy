import React, { useState, useEffect, useContext } from 'react'
import { withRouter, Link } from 'react-router-dom'
import Swatch from '../Swatch'
import PaletteActions from '../PaletteActions'
import { FavoritesContext } from '../FavoritesContext'
import Modali, { useModali } from 'modali'
import * as emailjs from 'emailjs-com'
import { db } from '../../config/firebaseconfig'
import saveAs from 'file-saver'
import moment from 'moment'
import { slugify } from '../../utils/helpers'
import Logo from '../Logo'

const UserPalettes = ({
    history,
    swatchInfo,
    currentUser,
    deletePalette,
    paletteExported,
    setPaletteExported
}) => {
    const [existing, setExisting] = useState(true)
    const [paletteModal, togglePaletteModal] = useModali(false)
    const [upgradeAccountModal, toggleUpgradeAccountModal] = useModali(false)
    const [accountLevel, setAccountLevel] = useState()
    const [paletteLink, setPaletteLink] = useState('')
    const [sharedPalette, setSharedPalette] = useState()
    const [paletteLinkModal, togglePaletteLinkModal] = useModali(false)

    const { favorites } = useContext(FavoritesContext)

    const smallAccounts = ['standard', 'pro']

    const sharePalette = (paletteName, palette) => {
        let palettes = db.collection('palettes')

        checkExistingPalette(palettes, palette, paletteName)
    }

    const checkExistingPalette = (palettes, palette, paletteName) => {
        let query = palettes
            .where('name', '==', paletteName)
            .get()
            .then(snapshot => {
                if (snapshot.empty) {
                    // console.log('No matching documents.')
                    setExisting(false)
                    share(palettes, palette, paletteName)
                    return
                }

                snapshot.forEach(doc => {
                    // console.log(doc.id, '=>', doc.data())
                    setExisting(true)
                    alert('Palette has already been shared!')
                })
            })
            .then()
            .catch(err => {
                console.log('Error getting documents', err)
            })

        return query
    }

    const share = (palettes, palette, paletteName) => {
        let now = new Date()
        let dateStringWithTime = moment(now).format('YYYY-MM-DD h:mm:ssa')
        let dateStringSlug = moment(now).format('YYYY-MM-DD_hmmss')
        palettes
            .doc(`${paletteName}_${dateStringSlug}`)
            .set({
                date: dateStringWithTime,
                likes: 0,
                name: paletteName,
                pid: `${paletteName}_${dateStringSlug}`,
                palette: palette
            })
            .then(
                setPaletteExported(true),
                togglePaletteModal(true),
                sendPaletteEmail(paletteName, dateStringWithTime)
            )
            .catch(err => {
                console.log('Error saving palette', err)
            })
    }

    const sendPaletteEmail = (paletteName, date) => {
        // console.log('in sendPaletteEmail')
        let template_params = {
            reply_to: 'reply_to_value',
            from_name: 'Hexy Palettes',
            message_html: `The palette <strong>${paletteName}</strong> was shared at ${date} on the
            hexy.io palette feed.`
        }

        const service_id = 'amazon_ses'
        const template_id = 'template_gUmNRWxO'
        emailjs.send(
            service_id,
            template_id,
            template_params,
            'user_mYvJGRsrKMRCCnsNFWefR'
        )
    }

    const exportCode = (palette, paletteName) => {
        if (
            currentUser &&
            smallAccounts.indexOf(currentUser.accountType) === 1
        ) {
            toggleUpgradeAccountModal(true)
            return
        }
        let now = new Date()
        let dateStringSlug = moment(now).format('YYYY-MM-DD_hmmss')
        let colorArray = palette.map(fav => {
            let name = slugify(fav.name)
            return '$' + name + ': ' + fav.hex + ';\r'
        })
        colorArray = colorArray.join('')
        let blob = new Blob([colorArray], {
            type: 'text/plain;charset=utf-8'
        })
        let paletteTitle = slugify(paletteName)
        saveAs(blob, `${paletteTitle}_${dateStringSlug}.txt`)
    }

    const handleLinkClick = () => {
        togglePaletteModal(false)
        const timeout = setTimeout(() => {
            history.push('/palettes')
        }, 1000)
        return () => {
            clearTimeout(timeout)
        }
    }

    useEffect(() => {
        if (currentUser && currentUser.accountType) {
            if (smallAccounts.indexOf(currentUser.accountType) !== 1) {
                setAccountLevel('high')
            }
        }
    }, [currentUser, smallAccounts])

    const shareLink = palette => {
        const id = palette.id
        let now = new Date()
        let dateStringWithTime = moment(now).format('YYYY-MM-DD h:mm:ssa')
        let sharedPalettes = db.collection('shared_palettes')

        sharedPalettes
            .doc(id)
            .set({
                date: dateStringWithTime,
                name: palette.name,
                id: id,
                palette: palette
            })
            .then(
                setPaletteLink(`/palette/${id}`),
                setSharedPalette(palette),
                togglePaletteLinkModal(true)
            )
            .catch(err => {
                console.log('Error saving palette', err)
            })
    }

    return (
        <div
            className={`nostyle palettes-list ${
                swatchInfo ? 'no-info' : 'info'
            }`}
        >
            {currentUser &&
                currentUser.palettes &&
                currentUser.palettes.length > 0 &&
                currentUser.palettes
                    .slice(0)
                    .reverse()
                    .map(palette => {
                        return (
                            <div
                                className="palette-wrap"
                                key={palette.date.seconds}
                            >
                                <div className="palette-title-bar">
                                    <div className="palette-name">
                                        {palette.name && palette.name}
                                    </div>

                                    <PaletteActions
                                        palette={palette}
                                        currentUser={currentUser}
                                        accountLevel={accountLevel}
                                        shareLink={shareLink}
                                        sharePalette={sharePalette}
                                        exportCode={exportCode}
                                        deletePalette={deletePalette}
                                    />
                                </div>

                                <ul className="user-palette nostyle">
                                    {palette.palette.map((color, index) => {
                                        let isFavorite
                                        if (favorites && favorites.length) {
                                            isFavorite = favorites.some(
                                                el => el.hex === color.hex
                                            )
                                        } else if (
                                            !favorites ||
                                            favorites.length === 0
                                        ) {
                                            isFavorite = false
                                        }
                                        return (
                                            <Swatch
                                                key={
                                                    palette.date.seconds +
                                                    color.hex
                                                }
                                                color={color}
                                                index={index}
                                                isFavorite={isFavorite}
                                            />
                                        )
                                    })}
                                </ul>
                            </div>
                        )
                    })}
            {paletteExported && (
                <Modali.Modal {...paletteModal} animated={true} centered={true}>
                    <div className="palette-message error-message">
                        <div className="error-header">
                            <Logo />
                            <h3>Your palette has been shared!</h3>
                        </div>
                        <p>
                            See it on the{' '}
                            <span
                                className="like-link"
                                onClick={handleLinkClick}
                            >
                                Palettes page
                            </span>
                            .
                        </p>
                    </div>
                </Modali.Modal>
            )}
            {toggleUpgradeAccountModal && (
                <Modali.Modal
                    {...upgradeAccountModal}
                    animated={true}
                    centered={true}
                >
                    <div className="error-message">
                        <div className="error-header">
                            <Logo />
                            <h3>Please upgrade your account.</h3>
                        </div>
                        <p>
                            Exporting to SCSS code is available to Hexy Pro
                            Unlimited and Hexy Pro Lifetime accounts.
                            <Link to="/pro">Upgrade now</Link> to export SCSS.
                        </p>
                        <button className="button">
                            <Link to="/pro">Upgrade</Link>
                        </button>
                    </div>
                </Modali.Modal>
            )}
            {currentUser && togglePaletteLinkModal ? (
                <Modali.Modal
                    {...paletteLinkModal}
                    animated={true}
                    centered={true}
                >
                    <div className="error-message">
                        <div className="error-header">
                            <Logo />
                            <h3>Your shareable palette link.</h3>
                        </div>
                        <p>Anyone with this link can view your palette:</p>
                        <p>
                            <Link
                                to={{
                                    pathname: paletteLink,
                                    palette: sharedPalette,
                                    userId: currentUser && currentUser.uid
                                }}
                            >
                                {`${window.location.origin.toString()}${paletteLink}`}
                            </Link>
                        </p>
                    </div>
                </Modali.Modal>
            ) : null}
        </div>
    )
}

export default withRouter(UserPalettes)
