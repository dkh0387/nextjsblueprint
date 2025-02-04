/**
 * Components, which wraps all child components containing tags.
 * Those tags become linkable through it.
 * We are using linkify package here (see [package.json]).
 */
import React from "react";
import Link from "next/link";
import { LinkIt, LinkItUrl } from "react-linkify-it";

interface LinkifyProps {
  children: React.ReactNode;
}

export default function Linkify(props: LinkifyProps) {
  return (
    <LinkifyUsername>
      <LinkifyHashtag>
        <LinkifyUrl children={props.children}></LinkifyUrl>
      </LinkifyHashtag>
    </LinkifyUsername>
  );
}

function LinkifyUrl(props: LinkifyProps) {
  return (
    <LinkItUrl className="text-primary hover:underline">
      {props.children}
    </LinkItUrl>
  );
}

function LinkifyUsername(props: LinkifyProps) {
  return (
    <LinkIt
      /*looking for username with @*/
      regex={/(@[a-zA-Z0-9_-]+)/}
      component={(match, key) => {
        /*remove @ in front*/
        const username = match.slice(1);
        return (
          <Link
            key={key}
            href={`/users/${username}`}
            className="text-primary hover:underline"
          >
            {match}
          </Link>
        );
      }}
    >
      {props.children}
    </LinkIt>
  );
}

function LinkifyHashtag(props: LinkifyProps) {
  return (
    <LinkIt
      /*looking for hashtag with #*/
      regex={/(#[a-zA-Z0-9]+)/}
      component={(match, key) => {
        /*remove # in front*/
        const hashtag = match.slice(1);
        return (
          <Link
            key={key}
            href={`/hashtag/${hashtag}`}
            className="text-primary hover:underline"
          >
            {match}
          </Link>
        );
      }}
    >
      {props.children}
    </LinkIt>
  );
}
